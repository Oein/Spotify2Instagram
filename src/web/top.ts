function loadXHR_TOP(url: string) {
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
      console.error(err);
      reject(err.message);
    }
  });
}

function createRankElement(title: string, author: string, imgURL: string) {
  return new Promise<HTMLDivElement>((resolve) => {
    let mf = document.createElement("div");
    let img = document.createElement("img");
    let d = document.createElement("div");
    let dc = document.createElement("div");
    let h1 = document.createElement("h1");
    let h2 = document.createElement("h2");

    h1.innerText = title;
    h2.innerText = author;

    mf.className = "m";
    mf.id = "f";
    d.className = "d";
    dc.className = "dc";

    dc.appendChild(h1);
    dc.appendChild(h2);
    d.appendChild(dc);

    loadXHR_TOP(imgURL).then((blob: any) => {
      let blobUrl = window.URL.createObjectURL(blob);
      img.src = blobUrl;

      mf.appendChild(img);
      mf.appendChild(d);

      resolve(mf);
    });
  });
}

let rootElement = document.getElementById("body") as HTMLDivElement;
let token__: string | null = null;

function waitToken() {
  return new Promise<void>((res) => {
    let inter = setInterval(() => {
      if (token__ != null) {
        res();
        clearInterval(inter);
      }
    }, 100);
  });
}

window.setMusics = async (musics: { times: number; url: string }[]) => {
  console.log(musics);
  await waitToken();
  for (let i = 0, t = 0; t < 5; t++, i = (i + 1) % musics.length) {
    let { data } = await window.axios({
      url: `https://api.spotify.com/v1/tracks/${musics[i].url.replace(
        `https://open.spotify.com/track/`,
        ""
      )}`,
      headers: {
        Authorization: "Bearer " + token__,
      },
    });
    console.log(data);
    let name = data["name"];
    let author = (
      data["artists"] as {
        name: string;
      }[]
    )
      .map((j) => j["name"])
      .join(", ");
    let albumURL = data["album"]["images"][0]["url"];
    rootElement.appendChild(await createRankElement(name, author, albumURL));
  }
};

window.handleAuth = (token: string) => {
  token__ = token;
};
