interface LastData {
  n: string;
  a: string;
  i: string;
  p: number;
}

var token: string | null = null;
var lastMusicURL: string | null = null;
var lastTokenGenerated: number | null = null;
var playdatawin: null | Window = null;
var lastData: LastData | null = null;

function showReauth() {
  (document.getElementById("resign") as HTMLButtonElement).style.top = "0px";
}
function hideReauth() {
  (document.getElementById("resign") as HTMLButtonElement).style.top = "-100%";
}

function loadXHR(url: string) {
  return new Promise(function (resolve, reject) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onerror = function () {
        reject("Network error.");
      };
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject("Loading error:" + xhr.statusText);
        }
      };
      xhr.send();
    } catch (err: any) {
      showReauth();
      console.error(err);
      ipcRenderer.invoke("err", err.toString());
      reject(err.message);
    }
  });
}

function fetchWhatIsPlaying() {
  const intervaler = () => {
    setTimeout(fetchWhatIsPlaying, 1000 * 10);
  };
  if (token == null || lastTokenGenerated == null) return intervaler();
  if (new Date().getTime() - lastTokenGenerated >= 1000 * 60 * 30) {
    // refresh token
    window.ipcRenderer.invoke("refresh", token);
    token = null;
    return;
  }
  window
    .axios({
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((res) => {
      const { data } = res;
      const nPlaying = document.getElementById(
        "notPlaying"
      ) as HTMLHeadingElement;
      const mContainer = document.getElementById(
        "musicdataContainer"
      ) as HTMLDivElement;
      if (data == null || data == "" || !data["is_playing"]) {
        nPlaying.style.display = "block";
        mContainer.style.display = "none";
        return;
      }

      nPlaying.style.display = "none";
      mContainer.style.display = "block";

      let name = data["item"]["name"];
      let author = (
        data["item"]["artists"] as {
          name: string;
        }[]
      )
        .map((j) => j["name"])
        .join(", ");
      let musicUrl = data["item"]["external_urls"]["spotify"];
      lastMusicURL = musicUrl;

      (document.getElementById("title") as HTMLHeadingElement).innerText = name;
      (document.getElementById("artist") as HTMLSpanElement).innerText = author;

      lastData = {
        n: name,
        a: author,
        i: data["item"]["album"]["images"][0]["url"],
        p:
          (parseInt(data["progress_ms"]) /
            parseInt(data["item"]["duration_ms"])) *
          100,
      };

      if (playdatawin) playdatawin.postMessage(lastData);

      loadXHR(data["item"]["album"]["images"][0]["url"]).then((blob: any) => {
        let blobUrl = window.URL.createObjectURL(blob);
        (document.getElementById("cover") as HTMLImageElement).src = blobUrl;
        setTimeout(() => {
          window
            .html2canvas(document.getElementById("musicdataContainer"))
            .then((canvas) => {
              let dataUrl = canvas.toDataURL("image/jpeg");
              window.ipcRenderer.invoke("music", {
                img: dataUrl,
                tit: name,
                aut: author,
                url: musicUrl,
              });
            });
        }, 100);
      });
    })
    .catch((err) => {
      showReauth();
      console.error(err);
      ipcRenderer.invoke("err", err.toString());
    });
  return intervaler();
}

function handleAuth(accessToken: string) {
  lastTokenGenerated = new Date().getTime();
  token = accessToken;
  window
    .axios({
      url: "https://api.spotify.com/v1/me",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((res) => {
      (document.getElementById("userdata") as HTMLDivElement).style.display =
        "block";
      (document.getElementById("playdata") as HTMLDivElement).style.display =
        "block";
      (document.getElementById("username") as HTMLSpanElement).innerText =
        res.data.display_name;
      fetchWhatIsPlaying();
    })
    .catch((err) => {
      showReauth();
      console.error(err);
      ipcRenderer.invoke("err", err.toString());
    });
}

interface AlertMessage {
  msg: string;
  ms: number;
}

let messageQueue: AlertMessage[] = [];

function __al(msg: AlertMessage) {
  let div = document.createElement("div");
  div.style.position = "fixed";
  div.style.bottom = "-48px";
  div.style.transition = "all 0.3s";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.height = "48px";
  div.style.lineHeight = "48px";
  div.style.textAlign = "center";
  div.style.color = "white";
  div.style.width = "max-content";
  div.style.minWidth = "min(50vw,300px)";
  div.style.background = "rgba(4, 170, 109,0.8)";
  div.style.borderRadius = "8px 8px 0px 0px";
  div.style.padding = "0px 2em";

  div.innerText = msg.msg;

  document.body.appendChild(div);

  setTimeout(() => {
    div.style.bottom = "0px";

    setTimeout(() => {
      div.style.bottom = "-48px";
      setTimeout(() => {
        div.remove();
        messageQueue.shift();
        if (messageQueue.length > 0) __al(messageQueue[0]);
      }, 500);
    }, msg.ms || 2000);
  }, 10);
}

function alertToTheBottom(message = "test message", ms = 2000) {
  messageQueue.push({
    msg: message,
    ms: ms,
  });
  if (messageQueue.length == 1) __al(messageQueue[0]);
}

setInterval(() => {
  document.documentElement.style.setProperty(
    "--percent",
    `${Math.random() * 80 + 10}%`
  );
}, 5000);

window.givePlayData = () => {
  if (playdatawin && lastData != null) playdatawin.postMessage(lastData);
};

(document.getElementById("openwin") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    playdatawin = window.open("./playdata.html", "playdata");
    if (!playdatawin) return;
    playdatawin.addEventListener("close", () => {
      playdatawin = null;
    });
    window.ipcRenderer.invoke("focus");
  }
);

(document.getElementById("resign") as HTMLButtonElement).addEventListener(
  "click",
  () => {
    window.ipcRenderer.invoke("reauth");
  }
);
