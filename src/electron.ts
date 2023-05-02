import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { existsSync, writeFileSync, mkdirSync, readFile, rmSync } from "fs";
import { IgApiClient } from "instagram-private-api";
import { promisify } from "util";
import { addListenCount, getImgURL } from "./music";
import axios from "axios";

const readFileAsync = promisify(readFile);

const appData = join(app.getPath("userData"));
const errDir = join(appData, "errors");
const config = join(appData, "config.env");

let token = "";
let code = "";
let refresh = "";

console.log("ERR DIR", errDir);
console.log("CONFIG", config);

if (!existsSync(errDir)) mkdirSync(errDir, { recursive: true });

if (!existsSync(config))
  writeFileSync(
    config,
    [
      `IG_USERNAME=""`,
      `IG_PASSWORD=""`,
      `SP_CLIENT_ID=""`,
      `SP_SECRET_KEY=""`,
    ].join("\n")
  );

let shownErr = {
  title: "",
  text: "",
};

require("dotenv").config({
  path: config,
});

if (!process.env.IG_USERNAME)
  shownErr = {
    title: "Env error",
    text: `Env "IG_USERNAME" is empty`,
  };

if (!process.env.IG_PASSWORD)
  shownErr = {
    title: "Env error",
    text: `Env "IG_PASSWORD" is empty`,
  };

if (!process.env.SP_CLIENT_ID)
  shownErr = {
    title: "Env error",
    text: `Env "SP_CLIENT_ID" is empty`,
  };

if (!process.env.SP_SECRET_KEY)
  shownErr = {
    title: "Env error",
    text: [`Env "SP_SECRET_KEY" is empty`, `Env Path : ${config}`].join("\n"),
  };

const spotifyQuery = {
  client_id: process.env.SP_CLIENT_ID,
  redirect_uri: "sptoinsta://oauth",
  scope: "user-read-currently-playing",
  response_type: "code",
  show_dialog: "true",
};

const multiplyString = (str: string, times: number) => {
  let out = "";
  while (times) {
    out += String;
    times--;
  }
  return out;
};

const writeErr = (
  err: Error | string,
  errName = "Nodejs Error",
  closeErr = true
) => {
  writeFileSync(
    join(errDir, new Date().getTime().toString() + ".error.txt"),
    [
      `========== ${new Date().toString()} ==========`,
      ` - Title / ${errName}`,
      multiplyString(
        "=",
        `========== ${new Date().toString()} ==========`.length
      ),
      `${err}`,
    ].join("\n")
  );
  openErrWin(errName, err.toString(), closeErr);
};

const openErrWin = (title: string, text: string, closeErr = true) => {
  return new Promise<void>((resolve) => {
    let errWin = new BrowserWindow({
      width: 400,
      height: 200,
      title: "Error Window",
    });

    errWin.loadFile("./build/static/error.html");
    errWin.webContents.addListener("dom-ready", () => {
      errWin.webContents.executeJavaScript(
        `al(${JSON.stringify(title)}, ${JSON.stringify(text)})`
      );
    });
    if (closeErr)
      errWin.on("close", () => {
        process.exit();
      });
    else resolve();
  });
};

const ig = new IgApiClient();
const serverAuth =
  "Basic " +
  new (Buffer as any).from(
    ((process.env.SP_CLIENT_ID! as string) +
      ":" +
      (process.env.SP_SECRET_KEY! as string)) as any
  ).toString("base64");

async function login() {
  // basic login-procedure
  try {
    ig.state.generateDevice(process.env.IG_USERNAME! as string);
    await ig.account.login(
      process.env.IG_USERNAME! as string,
      process.env.IG_PASSWORD! as string
    );
  } catch (err: any) {
    writeErr(err);
    await openErrWin("Instagram Error", "Failed to signin.");
  }
}

let win: BrowserWindow | null = null;

const createWindow = async () => {
  await login();
  let win = new BrowserWindow({
    width: 460,
    height: 750,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
    title: "Main window",
  });

  let url =
    "https://accounts.spotify.com/authorize?" + urlEncodeSet(spotifyQuery);
  win.loadURL(url);

  win.webContents.on("will-navigate", function (event: any, newUrl: string) {
    event.preventDefault();
    code = newUrl.replace(`sptoinsta://oauth/?code=`, "");

    axios({
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      data: {
        code: code,
        redirect_uri: "sptoinsta://oauth",
        grant_type: "authorization_code",
      },
      headers: {
        Authorization: serverAuth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((v) => {
        console.log(v.data);
        token = v.data.access_token;
        refresh = v.data.refresh_token;

        win.loadFile("./build/static/index.html");
        win.webContents.addListener("dom-ready", () => {
          win.webContents.executeJavaScript('handleAuth("' + token + '")');
          win.webContents.executeJavaScript(
            `alertToTheBottom("Successfully refreshed your token")`
          );
        });
      })
      .catch((err) => {
        writeErr(err);
      });
    return;
  });
};

function urlEncodeSet(set: any) {
  let comps = [];
  for (let i in set) {
    if (set.hasOwnProperty(i)) {
      comps.push(encodeURIComponent(i) + "=" + encodeURIComponent(set[i]));
    }
  }
  let string = comps.join("&");
  return string;
}

app.whenReady().then(async () => {
  if (shownErr.title.length || shownErr.text.length)
    await openErrWin(shownErr.title, shownErr.text);
  createWindow();
  ipcMain.handle("focus", () => {
    BrowserWindow.getAllWindows()
      .filter(
        (win) =>
          win.webContents.getTitle() == "Play data viewer" ||
          win.webContents.getTitle() == ""
      )[0]
      .focus();
  });
  ipcMain.handle("refresh", async (e, old) => {
    if (win == null) return;
    axios({
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization: serverAuth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      data: {
        grant_type: "refresh_token",
        refresh_token: refresh,
      },
    })
      .then((v) => {
        console.log(v.data);
        token = v.data.access_token;
        if (win != null)
          win.webContents.executeJavaScript('handleAuth("' + token + '")');
      })
      .catch((err) => {
        writeErr(err);
      });
  });
  ipcMain.handle("music", async (e, data) => {
    const { img, url, tit, aut } = data;

    const iurl = getImgURL(url);
    const iexi = existsSync(iurl);

    if (!iexi) {
      console.log("Write img to", `"${iurl}"`);
      writeFileSync(
        iurl,
        img.replace(/^data:image\/jpeg;base64,/, ""),
        "base64"
      );
    }

    if (addListenCount(url)) {
      ig.publish
        .photo({
          file: await readFileAsync(iurl),
          caption: `Listen "${tit}" by "${aut}" on ${url}`,
        })
        .then(() => {
          rmSync(iurl);
          if (win != null)
            win.webContents.executeJavaScript(
              `alertToTheBottom("Successfully uploaded to instagram.",4000)`
            );
        })
        .catch((err) => {
          writeErr(err);
          if (win != null)
            win.webContents.executeJavaScript(
              `alertToTheBottom("Failed to upload to instagram.",4000)`
            );
        });
    }
  });
  ipcMain.handle("err", (e, err) => {
    writeErr(err, "Web Error", false);
  });
  ipcMain.handle("reauth", () => {
    if (win) win.close();
    createWindow();
  });
});
