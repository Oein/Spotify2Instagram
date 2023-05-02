window.al = (a: string, b: string) => {
  (document.getElementById("t") as HTMLSpanElement).innerText = a;
  (document.getElementById("d") as HTMLSpanElement).innerText = b;
};
