var authWindow = null;
var token = null;
var lastMusicURL = null;
var lastTokenGenerated = null;
var playdatawin = null;

var lastData = null;

function loadXHR(url) {
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
    } catch (err) {
      reject(err.message);
    }
  });
}

function fetchWhatIsPlaying() {
  const intervaler = () => {
    setTimeout(fetchWhatIsPlaying, 1000 * 10);
  };
  if (token == null) return intervaler();
  if (new Date().getTime() - lastTokenGenerated >= 1000 * 60 * 30) {
    // refresh token
    window.ipcRenderer.invoke("refresh", token);
    token = null;
    return;
  }
  axios({
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      const { data } = res;
      if (data == null || data == "" || !data["is_playing"]) {
        document.getElementById("notPlaying").style.display = "block";
        document.getElementById("musicdataContainer").style.display = "none";
        return;
      }

      document.getElementById("notPlaying").style.display = "none";
      document.getElementById("musicdataContainer").style.display = "block";

      let name = data["item"]["name"];
      let author = data["item"]["artists"].map((j) => j["name"]).join(", ");
      let musicUrl = data["item"]["external_urls"]["spotify"];
      lastMusicURL = musicUrl;

      document.getElementById("title").innerText = name;
      document.getElementById("artist").innerText = author;

      lastData = JSON.stringify({
        n: name,
        a: author,
        i: data["item"]["album"]["images"][0]["url"],
        p:
          (parseInt(data["progress_ms"]) /
            parseInt(data["item"]["duration_ms"])) *
          100,
      });

      if (playdatawin) playdatawin.postMessage(lastData);

      loadXHR(data["item"]["album"]["images"][0]["url"]).then((blob) => {
        let blobUrl = window.URL.createObjectURL(blob);
        document.getElementById("cover").src = blobUrl;
        setTimeout(() => {
          html2canvas(document.getElementById("musicdataContainer")).then(
            (canvas) => {
              let dataUrl = canvas.toDataURL("image/jpeg");
              window.ipcRenderer.invoke("music", {
                img: dataUrl,
                tit: name,
                aut: author,
                url: musicUrl,
              });
            }
          );
        }, 100);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  return intervaler();
}

function handleAuth(accessToken) {
  lastTokenGenerated = new Date().getTime();
  token = accessToken;
  axios({
    url: "https://api.spotify.com/v1/me",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      document.getElementById("userdata").style.display = "block";
      document.getElementById("playdata").style.display = "block";
      document.getElementById("username").innerText = res.data.display_name;
      fetchWhatIsPlaying();
    })
    .catch((err) => {
      console.error(err);
    });
}

let messageQueue = [];

function __al(msg) {
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

function givePlayData() {
  if (playdatawin && lastData != null) playdatawin.postMessage(lastData);
}

document.getElementById("openwin").addEventListener("click", () => {
  playdatawin = window.open("./playdata.html", "playdata");
  playdatawin.addEventListener("close", () => {
    playdatawin = null;
  });
});
