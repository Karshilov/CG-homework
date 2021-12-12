// 材质
class Material {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  uniforms: any;

  constructor(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    gl: WebGL2RenderingContext | WebGLRenderingContext
  ) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.program = (() => {
      let program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));

      return program;
    })();
    this.uniforms = (() => {
      let uniforms: any = {};
      let uniformCount = gl.getProgramParameter(
        this.program,
        gl.ACTIVE_UNIFORMS
      );
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(this.program, i)!.name;
        uniforms[uniformName] = gl.getUniformLocation(
          this.program,
          uniformName
        );
      }
      return uniforms;
    })();
  }

  bind(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    gl.useProgram(this.program);
  }
}
