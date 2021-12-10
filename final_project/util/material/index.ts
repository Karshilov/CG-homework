// 材质
class Material {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;

  constructor(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    program: WebGLProgram
  ) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.program = program;
  }

  bind(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    gl.useProgram(this.program);
  }
}
