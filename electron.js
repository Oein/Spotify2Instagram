const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const {
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  readFile,
  rmSync,
} = require("fs");
const { IgApiClient } = require("instagram-private-api");
const { promisify } = require("util");

const axios = require("axios");
const readFileAsync = promisify(readFile);

const appData = join(app.getPath("userData"));
const imgDir = join(appData, "imgs");
const errDir = join(appData, "errors");
const config = join(appData, "config.env");
const listenTime = join(appData, "listens");

console.log("IMG DIR", imgDir);
console.log("ERR DIR", errDir);
console.log("CONFIG", config);

if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });
if (!existsSync(errDir)) mkdirSync(errDir, { recursive: true });
if (!existsSync(listenTime)) mkdirSync(listenTime, { recursive: true });

if (!existsSync(config))
  writeFileSync(
    config,
    `IG_USERNAME=""
IG_PASSWORD=""
SP_CLIENT_ID=""
SP_SECRET_KEY=""`
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
    text: `Env "SP_SECRET_KEY" is empty\nEnv Path : ${config}`,
  };

const writeErr = (err) => {
  writeFileSync(
    join(errDir, new Date().getTime().toString() + ".error.txt"),
    `========== ${new Date().toString()} ==========\n${err}`
  );
  shownErr("Nodejs Error", err.toString());
};

const openErrWin = (title, text) => {
  return new Promise(() => {
    let win = new BrowserWindow({
      width: 400,
      height: 200,
    });

    win.loadFile("web/error.html");
    win.webContents.addListener("dom-ready", () => {
      win.webContents.executeJavaScript(
        `al(${JSON.stringify(title)}, ${JSON.stringify(text)})`
      );
    });
    win.on("close", () => {
      process.exit();
    });
  });
};

const ig = new IgApiClient();
const serverAuth =
  "Basic " +
  new Buffer.from(
    process.env.SP_CLIENT_ID + ":" + process.env.SP_SECRET_KEY
  ).toString("base64");

async function login() {
  // basic login-procedure
  try {
    ig.state.generateDevice(process.env.IG_USERNAME);
    await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  } catch (err) {
    writeErr(err);
    await openErrWin("Instagram Error", "Failed to signin.");
  }
}

const createWindow = async () => {
  await login();
  let win = new BrowserWindow({
    minWidth: 460,
    minHeight: 750,
    width: 460,
    height: 750,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });
  var set = {
    client_id: process.env.SP_CLIENT_ID,
    redirect_uri: "sptoinsta://oauth",
    scope: "user-read-currently-playing",
    response_type: "code",
    show_dialog: "true",
  };
  var url = "https://accounts.spotify.com/authorize?" + urlEncodeSet(set);
  win.loadURL(url);

  var token = "";
  var code = "";
  var refresh = "";

  win.webContents.on("will-navigate", function (event, newUrl) {
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

        win.loadFile("web/index.html");
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

  ipcMain.handle("music", async (e, data) => {
    const { img, url, tit, aut } = data;
    const b64 = Buffer.from(encodeURIComponent(url), "base64").toString(
      "base64"
    );
    const furl = join(listenTime, b64);
    const iurl = join(imgDir, b64 + ".jpg");
    const exsi = existsSync(furl);
    const iexi = existsSync(iurl);
    const count2upload = 5;

    console.log("Add cache to", `"${furl}"`);
    if (exsi) {
      let oldData = parseInt(readFileSync(furl));
      console.log(oldData, count2upload, oldData == count2upload);
      if (oldData == count2upload) {
        console.log("Upload to instgram");
        ig.publish
          .photo({
            file: await readFileAsync(iurl),
            caption: `Listen "${tit}" by "${aut}" on ${url}`,
          })
          .then(() => {
            rmSync(iurl);
            win.webContents.executeJavaScript(
              `alertToTheBottom("Successfully uploaded to instagram.",4000)`
            );
          })
          .catch((err) => {
            writeErr(err);
            win.webContents.executeJavaScript(
              `alertToTheBottom("Failed to upload to instagram.",4000)`
            );
          });
      }
      oldData += 1;
      writeFileSync(furl, oldData.toString());
      return;
    } else {
      writeFileSync(furl, "1");
      if (!iexi) {
        console.log("Write img to", `"${iurl}"`);
        writeFileSync(
          iurl,
          img.replace(/^data:image\/jpeg;base64,/, ""),
          "base64"
        );
      }
    }
  });

  ipcMain.handle("refresh", async (e, old) => {
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
        win.webContents.executeJavaScript('handleAuth("' + token + '")');
      })
      .catch((err) => {
        writeErr(err);
      });
  });
};

function urlEncodeSet(set) {
  var comps = [];
  for (var i in set) {
    if (set.hasOwnProperty(i)) {
      comps.push(encodeURIComponent(i) + "=" + encodeURIComponent(set[i]));
    }
  }
  var string = comps.join("&");
  return string;
}

app.whenReady().then(async () => {
  if (shownErr.title.length || shownErr.text.length)
    await openErrWin(shownErr.title, shownErr.text);
  createWindow();
});
