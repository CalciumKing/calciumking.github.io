// This script displays its own source code as a page element on the 404 page
(function () {
    var codeElement = document.querySelector('#code-element');
    fetch('/js/source-code.ts')
        .then(function (result) { return result.text(); })
        .then(function (code) {
        var lines = code.split('\n');
        var lineNum = 0;
        var intervalId = setInterval(function () {
            codeElement.textContent += lines[lineNum] + '\n';
            lineNum++;
            if (lineNum >= lines.length)
                clearInterval(intervalId);
        }, 300);
    });
})();
