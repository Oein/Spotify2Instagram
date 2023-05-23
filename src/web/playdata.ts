const p2 = (str: string) => (str.length <= 1 ? "0" + str : str);

function toms(ms: number) {
  ms /= 1000;
  return `${Math.floor(ms / 60)}:${p2(Math.floor(ms % 60).toString())}`;
}

let pls = 0;
let ens = 0;
let ply = false;

function fetchNum() {
  (document.getElementById("now") as HTMLHeadingElement).innerText = toms(pls);
  (document.getElementById("end") as HTMLHeadingElement).innerText = toms(ens);
  document.documentElement.style.setProperty(
    "--percent",
    `${(pls / ens) * 100}%`
  );
}

function fetdt(n: string, a: string, i: string) {
  (document.getElementById("title") as HTMLHeadingElement).innerText = n;
  (document.getElementById("artist") as HTMLSpanElement).innerText = a;
  (document.getElementById("cover") as HTMLImageElement).src = i;
  document.body.style.backgroundImage = `url(${i})`;

  fetchNum();
}

window.addEventListener(
  "message",
  (event) => {
    let dt = event.data;
    ply = dt["pl"] == 1;
    console.log(dt);
    if (dt["pls"] == undefined) return;
    pls = dt["pls"];
    ens = dt["ens"];
    if (dt["n"]) fetdt(dt["n"], dt["a"], dt["i"]);
  },
  false
);

window.addEventListener("DOMContentLoaded", () => {
  window.opener.eval("givePlayData()");
  setInterval(() => {
    if (ply) pls = Math.min(pls + 500, ens);
    fetchNum();
  }, 500);
});
