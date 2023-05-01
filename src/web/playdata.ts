window.addEventListener(
  "message",
  (event) => {
    let dt = event.data;
    let n = dt["n"];
    let a = dt["a"];
    let i = dt["i"];
    (document.getElementById("title") as HTMLHeadingElement).innerText = n;
    (document.getElementById("artist") as HTMLSpanElement).innerText = a;
    (document.getElementById("cover") as HTMLImageElement).src = i;
    document.documentElement.style.setProperty("--percent", `${dt["p"]}%`);
  },
  false
);

window.addEventListener("DOMContentLoaded", () => {
  window.opener.eval("givePlayData()");
});
