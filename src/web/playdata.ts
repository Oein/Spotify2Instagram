const p2 = (str: string) => (str.length <= 1 ? "0" + str : str);

function toms(ms: number) {
  console.log(ms);
  ms /= 1000;
  console.log(ms);
  return `${Math.floor(ms / 60)}:${p2(Math.floor(ms % 60).toString())}`;
}

let pls = 0;
let ens = 0;
let ply = false;

function fetchNum() {
  (document.getElementById("now") as HTMLHeadingElement).innerText = toms(pls);
  (document.getElementById("end") as HTMLHeadingElement).innerText = toms(ens);
}

function fetdt(n: string, a: string, i: string, p: number) {
  (document.getElementById("title") as HTMLHeadingElement).innerText = n;
  (document.getElementById("artist") as HTMLSpanElement).innerText = a;
  (document.getElementById("cover") as HTMLImageElement).src = i;
  document.body.style.backgroundImage = `url(${i})`;
  document.documentElement.style.setProperty("--percent", `${p}%`);

  fetchNum();
}

window.addEventListener(
  "message",
  (event) => {
    let dt = event.data;
    if (dt["pl"] == false) return (ply = false);
    ply = true;
    pls = dt["pls"];
    ens = dt["ens"];
    fetdt(dt["n"], dt["a"], dt["i"], dt["p"]);
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
