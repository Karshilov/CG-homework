"use strict";
// 材质
var Material = /** @class */ (function () {
    function Material(vertexShader, fragmentShader, program) {
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.program = program;
    }
    Material.prototype.bind = function (gl) {
        gl.useProgram(this.program);
    };
    return Material;
}());
