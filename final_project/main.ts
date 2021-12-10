import config from "./config";
import getWebGLContext from "./context";

(() => {
  const canvas = document.getElementById("fluid")! as HTMLCanvasElement;
  const root = document.getElementById("root")!;
  const prevStyle = root.getAttribute("style")!;
  root.setAttribute(
    "style",
    prevStyle +
      `background: rgba(${config.bg.r}, ${config.bg.g}, ${config.bg.b}, ${config.bg.a});`
  );
  const { gl, ext } = getWebGLContext(canvas);
})();
