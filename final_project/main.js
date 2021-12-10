import config from "./config";
import getWebGLContext from "./context";
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
})();
