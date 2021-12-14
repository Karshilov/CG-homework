import config from "./config";
import getWebGLContext from "./context";
import { advectionShader as advectionShaderSource, baseVertexShader as baseVertexShaderSource, blurShader as blurShaderSource, blurVertexShader as blurVertexShaderSource, clearShader as clearShaderSource, colorShader as colorShaderSource, copyShader as copyShaderSource, curlShader as curlShaderSource, displayShader as displayShaderSource, divergenceShader as divergenceShaderSource, gradientSubtractShader as gradientSubtractShaderSource, pressureShader as pressureShaderSource, splatShader as splatShaderSource, vorticityShader as vorticityShaderSource, compileShader, } from "./util/shader";
import { Material } from "./util/material";
import { blitGen, initFramebuffers, scaleByPixelRatio } from "./util/fbo";
var pointerPrototype = /** @class */ (function () {
    function pointerPrototype() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = [30, 0, 300];
    }
    return pointerPrototype;
}());
(function () {
    var isMobile = function () {
        return /Mobi|Android/i.test(navigator.userAgent);
    };
    if (isMobile()) {
        alert("暂不打算支持移动端");
        return;
    }
    var canvas = document.getElementById("fluid");
    var root = document.getElementById("root");
    var prevStyle = root.getAttribute("style");
    root.setAttribute("style", prevStyle +
        ("background: rgba(" + config.bg.r + ", " + config.bg.g + ", " + config.bg.b + ", " + config.bg.a + ");"));
    var _a = getWebGLContext(canvas), gl = _a.gl, ext = _a.ext;
    if (!gl) {
        alert("不支持webgl");
        return;
    }
    gl.clearColor(config.bg.r, config.bg.g, config.bg.b, config.bg.a);
    var blurVertexShader = compileShader(gl, gl.VERTEX_SHADER, blurVertexShaderSource);
    var baseVertexShader = compileShader(gl, gl.VERTEX_SHADER, baseVertexShaderSource);
    var blurShader = compileShader(gl, gl.FRAGMENT_SHADER, blurShaderSource);
    var copyShader = compileShader(gl, gl.FRAGMENT_SHADER, copyShaderSource);
    var clearShader = compileShader(gl, gl.FRAGMENT_SHADER, clearShaderSource);
    var colorShader = compileShader(gl, gl.FRAGMENT_SHADER, colorShaderSource);
    var splatShader = compileShader(gl, gl.FRAGMENT_SHADER, splatShaderSource);
    var advectionShader = compileShader(gl, gl.FRAGMENT_SHADER, advectionShaderSource);
    var divergenceShader = compileShader(gl, gl.FRAGMENT_SHADER, divergenceShaderSource);
    var curlShader = compileShader(gl, gl.FRAGMENT_SHADER, curlShaderSource);
    var vorticityShader = compileShader(gl, gl.FRAGMENT_SHADER, vorticityShaderSource);
    var pressureShader = compileShader(gl, gl.FRAGMENT_SHADER, pressureShaderSource);
    var gradientSubtractShader = compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShaderSource);
    var displayShader = compileShader(gl, gl.FRAGMENT_SHADER, displayShaderSource);
    var blurMaterial = new Material(blurVertexShader, blurShader, gl);
    var copyMaterial = new Material(baseVertexShader, copyShader, gl);
    var clearMaterial = new Material(baseVertexShader, clearShader, gl);
    var colorMaterial = new Material(baseVertexShader, colorShader, gl);
    var splatMaterial = new Material(baseVertexShader, splatShader, gl);
    var advectionMaterial = new Material(baseVertexShader, advectionShader, gl);
    var divergenceMaterial = new Material(baseVertexShader, divergenceShader, gl);
    var curlMaterial = new Material(baseVertexShader, curlShader, gl);
    var vorticityMaterial = new Material(baseVertexShader, vorticityShader, gl);
    var pressureMaterial = new Material(baseVertexShader, pressureShader, gl);
    var gradienSubtractMaterial = new Material(baseVertexShader, gradientSubtractShader, gl);
    var displayMaterial = new Material(baseVertexShader, displayShader, gl);
    var _b = initFramebuffers(gl, config, ext, copyMaterial), dye = _b.dye, velocity = _b.velocity, divergence = _b.divergence, curl = _b.curl, pressure = _b.pressure;
    multipleSplats(parseInt((Math.random() * 20).toString()) + 5);
    var lastUpdateTime = performance.now();
    var colorUpdateTimer = 0.0;
    var pointers = [];
    var splatStack = [];
    pointers.push(new pointerPrototype());
    update();
    function update() {
        var dt = calcDeltaTime();
        if (resizeCanvas())
            initFramebuffers(gl, config, ext, copyMaterial);
        updateColors(dt);
        applyInputs();
        if (!config.PAUSED)
            step(dt);
        render(null);
        requestAnimationFrame(update);
    }
    function wrap(value, min, max) {
        var range = max - min;
        if (range == 0)
            return min;
        return ((value - min) % range) + min;
    }
    function calcDeltaTime() {
        var now = performance.now();
        var dt = (now - lastUpdateTime) / 1000;
        dt = Math.min(dt, 0.016666);
        lastUpdateTime = now;
        return dt;
    }
    function resizeCanvas() {
        var width = scaleByPixelRatio(canvas.clientWidth);
        var height = scaleByPixelRatio(canvas.clientHeight);
        if (canvas.width != width || canvas.height != height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    }
    function updateColors(dt) {
        if (!config.COLORFUL)
            return;
        colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
        if (colorUpdateTimer >= 1) {
            colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
            pointers.forEach(function (p) {
                p.color = generateColor();
            });
        }
    }
    function applyInputs() {
        if (splatStack.length > 0)
            multipleSplats(splatStack.pop());
        pointers.forEach(function (p) {
            if (p.moved) {
                p.moved = false;
                splatPointer(p);
            }
        });
    }
    function step(dt) {
        gl.disable(gl.BLEND);
        curlMaterial.bind(gl);
        gl.uniform2f(curlMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlMaterial.uniforms.uVelocity, velocity.read.attach(0));
        blitGen(gl)(curl);
        vorticityMaterial.bind(gl);
        gl.uniform2f(vorticityMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityMaterial.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityMaterial.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(vorticityMaterial.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityMaterial.uniforms.dt, dt);
        blitGen(gl)(velocity.write);
        velocity.swap();
        divergenceMaterial.bind(gl);
        gl.uniform2f(divergenceMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceMaterial.uniforms.uVelocity, velocity.read.attach(0));
        blitGen(gl)(divergence);
        clearMaterial.bind(gl);
        gl.uniform1i(clearMaterial.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(clearMaterial.uniforms.value, config.PRESSURE);
        blitGen(gl)(pressure.write);
        pressure.swap();
        pressureMaterial.bind(gl);
        gl.uniform2f(pressureMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureMaterial.uniforms.uDivergence, divergence.attach(0));
        for (var i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureMaterial.uniforms.uPressure, pressure.read.attach(1));
            blitGen(gl)(pressure.write);
            pressure.swap();
        }
        gradienSubtractMaterial.bind(gl);
        gl.uniform2f(gradienSubtractMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradienSubtractMaterial.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradienSubtractMaterial.uniforms.uVelocity, velocity.read.attach(1));
        blitGen(gl)(velocity.write);
        velocity.swap();
        advectionMaterial.bind(gl);
        gl.uniform2f(advectionMaterial.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        if (!ext.supportLinearFiltering)
            gl.uniform2f(advectionMaterial.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        var velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionMaterial.uniforms.uVelocity, velocityId);
        gl.uniform1i(advectionMaterial.uniforms.uSource, velocityId);
        gl.uniform1f(advectionMaterial.uniforms.dt, dt);
        gl.uniform1f(advectionMaterial.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blitGen(gl)(velocity.write);
        velocity.swap();
        if (!ext.supportLinearFiltering)
            gl.uniform2f(advectionMaterial.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionMaterial.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionMaterial.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionMaterial.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blitGen(gl)(dye.write);
        dye.swap();
    }
    function render(target) {
        if (target == null || !config.TRANSPARENT) {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }
        else {
            gl.disable(gl.BLEND);
        }
        if (!config.TRANSPARENT)
            drawColor(target, normalizeColor(config.BACK_COLOR));
        drawDisplay(target);
    }
    function drawColor(target, color) {
        colorMaterial.bind(gl);
        gl.uniform4f(colorMaterial.uniforms.color, color.r, color.g, color.b, 1);
        blitGen(gl)(target);
    }
    function drawDisplay(target) {
        // let width = target == null ? gl!.drawingBufferWidth : target.width;
        // let height = target == null ? gl!.drawingBufferHeight : target.height;
        displayMaterial.bind(gl);
        gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
        blitGen(gl)(target);
    }
    function blur(target, temp, iterations) {
        blurMaterial.bind(gl);
        for (var i = 0; i < iterations; i++) {
            gl.uniform2f(blurMaterial.uniforms.texelSize, target.texelSizeX, 0.0);
            gl.uniform1i(blurMaterial.uniforms.uTexture, target.attach(0));
            blitGen(gl)(temp);
            gl.uniform2f(blurMaterial.uniforms.texelSize, 0.0, target.texelSizeY);
            gl.uniform1i(blurMaterial.uniforms.uTexture, temp.attach(0));
            blitGen(gl)(target);
        }
    }
    function splatPointer(pointer) {
        var dx = pointer.deltaX * config.SPLAT_FORCE;
        var dy = pointer.deltaY * config.SPLAT_FORCE;
        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }
    function generateColor() {
        var c = HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.15;
        c.g *= 0.15;
        c.b *= 0.15;
        return c;
    }
    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                (r = v), (g = t), (b = p);
                break;
            case 1:
                (r = q), (g = v), (b = p);
                break;
            case 2:
                (r = p), (g = v), (b = t);
                break;
            case 3:
                (r = p), (g = q), (b = v);
                break;
            case 4:
                (r = t), (g = p), (b = v);
                break;
            case 5:
                (r = v), (g = p), (b = q);
                break;
        }
        return {
            r: r,
            g: g,
            b: b,
        };
    }
    function normalizeColor(input) {
        var output = {
            r: input.r / 255,
            g: input.g / 255,
            b: input.b / 255,
        };
        return output;
    }
    function multipleSplats(amount) {
        for (var i = 0; i < amount; i++) {
            var color = generateColor();
            color.r *= 10.0;
            color.g *= 10.0;
            color.b *= 10.0;
            var x = Math.random();
            var y = Math.random();
            var dx = 1000 * (Math.random() - 0.5);
            var dy = 1000 * (Math.random() - 0.5);
            splat(x, y, dx, dy, color);
        }
    }
    function correctRadius(radius) {
        var aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1)
            radius *= aspectRatio;
        return radius;
    }
    function splat(x, y, dx, dy, color) {
        splatMaterial.bind(gl);
        gl.uniform1i(splatMaterial.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatMaterial.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatMaterial.uniforms.point, x, y);
        gl.uniform3f(splatMaterial.uniforms.color, dx, dy, 0.0);
        gl.uniform1f(splatMaterial.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blitGen(gl)(velocity.write);
        velocity.swap();
        gl.uniform1i(splatMaterial.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatMaterial.uniforms.color, color.r, color.g, color.b);
        blitGen(gl)(dye.write);
        dye.swap();
    }
})();
