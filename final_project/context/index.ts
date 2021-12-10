type ReturnContext = {
    gl?: WebGL2RenderingContext | WebGLRenderingContext
    ext?: any
}

function supportRenderTextureFormat (gl: any, internalFormat: any, format: any, type: any) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
}

function getSupportedFormat(
  gl: any,
  internalFormat: any,
  format: any,
  type: any
): any {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F:
        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
      case gl.RG16F:
        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      default:
        return null;
    }
  }

  return {
    internalFormat,
    format,
  };
}

function getWebGLContext(canvas: HTMLCanvasElement): ReturnContext {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  let gl = canvas.getContext("webgl2", params) as
    | WebGL2RenderingContext
    | WebGLRenderingContext
    | null;
  const isWebGL2 = !!gl;
  if (!isWebGL2)
    gl =
      (canvas.getContext("webgl", params) as WebGLRenderingContext | null) ||
      (canvas.getContext(
        "experimental-webgl",
        params
      ) as WebGLRenderingContext | null);
  if (!!!gl) return {};
  let halfFloat;
  let supportLinearFiltering;
  if (isWebGL2) {
    gl.getExtension("EXT_color_buffer_float");
    supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float") as any;
    supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfFloatTexType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : halfFloat.HALF_FLOAT_OES;
  let formatRGBA;
  let formatRG;
  let formatR;

  if (isWebGL2) {
    formatRGBA = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).RGBA16F,
      gl.RGBA,
      halfFloatTexType
    );
    formatRG = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).RG16F,
      (gl as WebGL2RenderingContext).RG,
      halfFloatTexType
    );
    formatR = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).R16F,
      (gl as WebGL2RenderingContext).RED,
      halfFloatTexType
    );
  } else {
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    },
  };
}

export default getWebGLContext;
