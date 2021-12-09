import config from "./config";
(function () {
    var canvas = document.getElementById("fluid");
    var root = document.getElementById("root");
    var prevStyle = root.getAttribute("style");
    root.setAttribute("style", prevStyle +
        ("background: rgba(" + config.bg.r + ", " + config.bg.g + ", " + config.bg.b + ", " + config.bg.a + ");"));
})();
