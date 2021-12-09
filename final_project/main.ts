import config from "./config";

(() => {
  const canvas = document.getElementById("fluid")!;
  const root = document.getElementById("root")!;
  const prevStyle = root.getAttribute("style")!;
  root.setAttribute(
    "style",
    prevStyle +
      `background: rgba(${config.bg.r}, ${config.bg.g}, ${config.bg.b}, ${config.bg.a});`
  );
})();
