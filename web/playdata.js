window.addEventListener(
  "message",
  (event) => {
    console.log(event.data);
    let dt = JSON.parse(event.data);
    let n = dt["n"];
    let a = dt["a"];
    let i = dt["i"];
    document.getElementById("title").innerText = n;
    document.getElementById("artist").innerText = a;
    document.getElementById("cover").src = i;
    document.documentElement.style.setProperty("--percent", `${dt["p"]}%`);
  },
  false
);

window.addEventListener("DOMContentLoaded", () => {
  window.opener.eval("givePlayData()");
});
