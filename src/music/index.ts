import { join } from "path";
import { app } from "electron";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

interface MusicData {
  times: number;
  id: string;
  url: string;
}

const appData = join(
  app?.getPath("userData") ||
    "/Users/dev/Library/Application Support/Spotify2Instagram"
);
const imgDir = join(appData, "imgs");
const lastMonthFile = join(appData, "month");
const lastYearFile = join(appData, "year");
const listenTime = join(appData, "listens");
const thisMonthListen = join(appData, "thisMonth.json");
const count2upload = 5;

let fileMonth = -1;

console.log("LAST MONTH", lastMonthFile);
console.log("LAST YEAR", lastYearFile);
console.log("GLOBAL LISTEN DIR", listenTime);
console.log("MONTH LISTEN", thisMonthListen);

if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });
if (!existsSync(listenTime)) mkdirSync(listenTime, { recursive: true });
if (!existsSync(lastMonthFile))
  writeFileSync(lastMonthFile, new Date().getMonth().toString());
if (!existsSync(lastYearFile))
  writeFileSync(lastYearFile, new Date().getFullYear().toString());
if (!existsSync(thisMonthListen)) writeFileSync(thisMonthListen, "{}");

fileMonth = parseInt(readFileSync(lastMonthFile).toString());

let listensArray: { [key: string]: MusicData } = {};

function setMusicArray() {
  let dt = JSON.parse(readFileSync(thisMonthListen).toString()) as {
    [key: string]: MusicData;
  };
  listensArray = dt;
}

function toSortedArray(musicArray: { [key: string]: MusicData }) {
  let out: MusicData[] = [];
  console.log(JSON.stringify(out));
  out = out.sort((a, b) => {
    return b.times - a.times;
  });
  return out;
}

setMusicArray();
console.log(
  "==== Most listens ====\n" +
    toSortedArray(listensArray)
      .slice(0, 10)
      .map((j, i) => `${i}. ${j.id} / ${j.times}`)
      .join("\n")
);

export function url2id(url: string): string {
  return Buffer.from(encodeURIComponent(url), "base64")
    .toString("base64")
    .replace(`https3A2F2Fopenspotifycom2F`, "");
}

export function getImgURL(url: string): string {
  return join(imgDir, url2id(url) + ".jpg");
}

export function resetThisMonthData() {
  console.log("Reset this month data");
  writeFileSync(lastMonthFile, new Date().getMonth().toString());
  writeFileSync(lastYearFile, new Date().getFullYear().toString());
  writeFileSync(thisMonthListen, "{}");
}

export function addThisMonthCount(url: string) {
  const id = url2id(url);
  if (fileMonth != new Date().getMonth()) resetThisMonthData();
  if (typeof listensArray[id] == "undefined")
    listensArray[id] = {
      id: id,
      times: 0,
      url: url,
    };
  listensArray[id].times++;
  writeFileSync(thisMonthListen, JSON.stringify(listensArray));
}

export function addListenCount(url: string): boolean {
  const furl = getGlobalListenFileURL(url);
  const exsi = existsSync(furl);

  console.log("Add cache to", `"${furl}"`);

  addThisMonthCount(url);

  if (exsi) {
    let oldData = parseInt(readFileSync(furl).toString());
    oldData += 1;
    writeFileSync(furl, oldData.toString());
    return oldData == count2upload;
  } else {
    writeFileSync(furl, "1");
  }

  return false;
}

export function getGlobalListenFileURL(url: string): string {
  return join(listenTime, url2id(url));
}
