import config from "./config";
import getWebGLContext from "./context";
import {
  advectionShader as advectionShaderSource,
  baseVertexShader as baseVertexShaderSource,
  blurShader as blurShaderSource,
  blurVertexShader as blurVertexShaderSource,
  clearShader as clearShaderSource,
  colorShader as colorShaderSource,
  copyShader as copyShaderSource,
  curlShader as curlShaderSource,
  displayShader as displayShaderSource,
  divergenceShader as divergenceShaderSource,
  gradientSubtractShader as gradientSubtractShaderSource,
  pressureShader as pressureShaderSource,
  splatShader as splatShaderSource,
  vorticityShader as vorticityShaderSource,
  compileShader,
} from "./util/shader";

(() => {
  const isMobile = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };
  if (isMobile()) {
    alert("暂不打算支持移动端");
    return;
  }
  const canvas = document.getElementById("fluid")! as HTMLCanvasElement;
  const root = document.getElementById("root")!;
  const prevStyle = root.getAttribute("style")!;
  root.setAttribute(
    "style",
    prevStyle +
      `background: rgba(${config.bg.r}, ${config.bg.g}, ${config.bg.b}, ${config.bg.a});`
  );
  const { gl, ext } = getWebGLContext(canvas);
  if (!gl) {
    alert("不支持webgl");
    return;
  }
  gl.clearColor(config.bg.r, config.bg.g, config.bg.b, config.bg.a);

  const blurVertexShader = compileShader(gl, gl.VERTEX_SHADER, blurVertexShaderSource)
  const baseVertexShader = compileShader(gl, gl.VERTEX_SHADER, baseVertexShaderSource)
  const blurShader = compileShader(gl, gl.FRAGMENT_SHADER, blurShaderSource)
  const copyShader = compileShader(gl, gl.FRAGMENT_SHADER, copyShaderSource)
  const clearShader = compileShader(gl, gl.FRAGMENT_SHADER, clearShaderSource)
  const colorShader = compileShader(gl, gl.FRAGMENT_SHADER, colorShaderSource)
  const splatShader = compileShader(gl, gl.FRAGMENT_SHADER, splatShaderSource)
  const advectionShader = compileShader(gl, gl.FRAGMENT_SHADER, advectionShaderSource)
  const divergenceShader = compileShader(gl, gl.FRAGMENT_SHADER, divergenceShaderSource)
  const curlShader = compileShader(gl, gl.FRAGMENT_SHADER, curlShaderSource)
  const vorticityShader = compileShader(gl, gl.FRAGMENT_SHADER, vorticityShaderSource)
  const pressureShader = compileShader(gl, gl.FRAGMENT_SHADER, pressureShaderSource)
  const gradientSubtractShader = compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShaderSource)
  const displayShader = compileShader(gl, gl.FRAGMENT_SHADER, displayShaderSource)

  const blurMaterial = new Material(blurVertexShader, blurShader, gl);
  const copyMaterial = new Material(baseVertexShader, copyShader, gl);
  const clearMaterial = new Material(baseVertexShader, clearShader, gl);
  const colorMaterial = new Material(baseVertexShader, colorShader, gl);
  const splatMaterial = new Material(baseVertexShader, splatShader, gl);
  const advectionMaterial = new Material(baseVertexShader, advectionShader, gl);
  const divergenceMaterial = new Material(
    baseVertexShader,
    divergenceShader,
    gl
  );
  const curlMaterial = new Material(baseVertexShader, curlShader, gl);
  const vorticityMaterial = new Material(baseVertexShader, vorticityShader, gl);
  const pressureMaterial = new Material(baseVertexShader, pressureShader, gl);
  const gradienSubtractMaterial = new Material(
    baseVertexShader,
    gradientSubtractShader,
    gl
  );
  const displayMaterial = new Material(baseVertexShader, displayShader, gl);

  
})();
