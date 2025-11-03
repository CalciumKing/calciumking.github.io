const topButton = document.getElementById("toTopButton");

!function () {
    window.addEventListener("scroll", () => {
        topButton.style.display = (window.scrollY > 0) ? "block" : "none";
        const getTabHeight = () => document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = `${(window.scrollY / getTabHeight()) * 100}%`;
    });

    topButton.style.display = "none";
}();