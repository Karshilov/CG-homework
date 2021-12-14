// 材质
var Material = /** @class */ (function () {
    function Material(vertexShader, fragmentShader, gl) {
        var _this = this;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.program = (function () {
            var program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS))
                console.trace(gl.getProgramInfoLog(program));
            return program;
        })();
        this.uniforms = (function () {
            var uniforms = {};
            var uniformCount = gl.getProgramParameter(_this.program, gl.ACTIVE_UNIFORMS);
            for (var i = 0; i < uniformCount; i++) {
                var uniformName = gl.getActiveUniform(_this.program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(_this.program, uniformName);
            }
            return uniforms;
        })();
    }
    Material.prototype.bind = function (gl) {
        gl.useProgram(this.program);
    };
    return Material;
}());
export { Material };
