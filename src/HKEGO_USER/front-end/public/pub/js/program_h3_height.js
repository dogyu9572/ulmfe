function matchHeightByRow(selector) {
    var items = document.querySelectorAll(selector);
    if (!items.length) return;

    items.forEach(function (el) {
        el.style.height = 'auto';
    });

    var rows = {};
    items.forEach(function (el) {
        var top = el.offsetTop;
        if (!rows[top]) rows[top] = [];
        rows[top].push(el);
    });

    Object.keys(rows).forEach(function (top) {
        var group = rows[top];
        var maxHeight = 0;

        group.forEach(function (el) {
            if (el.offsetHeight > maxHeight) {
                maxHeight = el.offsetHeight;
            }
        });

        group.forEach(function (el) {
            el.style.height = maxHeight + 'px';
        });
    });
}

function initMatchHeight() {
    matchHeightByRow('.program_types li h3');
    matchHeightByRow('.program_list .txt h3');
}

function runAfterFullyReady() {
    var fontsReady = document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();

    fontsReady.then(function () {
        requestAnimationFrame(function () {
            requestAnimationFrame(initMatchHeight);
        });
    });

    setTimeout(initMatchHeight, 300);
    setTimeout(initMatchHeight, 800);
    setTimeout(initMatchHeight, 1500);
}

window.addEventListener('load', runAfterFullyReady);

var resizeTimer;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initMatchHeight, 200);
});