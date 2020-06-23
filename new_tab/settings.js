function launchSearch()
{
    let text = $(".search-input")[0].value;
    var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    var urlRegex = new RegExp(expression);
    var withoutHttps = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

    if (!text || text.trim().length == 0)
        return;
    chrome.storage.sync.get("openSearchNewTab", (res) => {
        if (res.openSearchNewTab) {
            if (text.match(withoutHttps)) {
                 chrome.tabs.create({ url: "https://" + text + "/" });
             } else if (text.match(urlRegex)) {
                 chrome.tabs.create({ url: text });
             } else
                 chrome.tabs.create({ url: "https://google.com/search?q=" + text });
        } else {
           if (text.match(withoutHttps)) {
                window.location = "https://" + text + "/";
            } else if (text.match(urlRegex)) {
                window.location = text;
            } else
                window.location = "https://google.com/search?q=" + text;
        }
    });
}

function handleNotifySlider()
{
    let beforeTimerSlider = document.getElementById("beforeTimer");
    let beforeTimerText = document.getElementById("beforeTimer-text");
    beforeTimerText.innerHTML = beforeTimerSlider.value;

    beforeTimerSlider.addEventListener("input", () => {
        if (beforeTimerSlider.value < 2 || beforeTimerSlider.value > 30 || Number(beforeTimerSlider.value) == "NaN")
            return;
        beforeTimerText.innerHTML = beforeTimerSlider.value;
        chrome.storage.sync.set({ notifyTimer: beforeTimerSlider.value });
        updateNotifyMinutes(beforeTimerSlider.value);
    });
}

function handleBackgroundButtons()
{
    $(".refreshPicture").click(() => {
        chrome.storage.sync.set({ background: null });
        updateBackground();
    });
    $(".keepBackground").click(() => {
        chrome.storage.sync.set({ background: document.querySelector("body").style.backgroundImage });
    });
    $(".clearBackground").click(() => {
        chrome.storage.sync.set({ background: "url(../images/black.png)" });
        updateBackground();
    });
}

function handleOpenEvent()
{
    let openEventNewTabElement = document.getElementById("openEventNewTab");

    chrome.storage.sync.get("openEventNewTab", (res) => {
        if (res.openEventNewTab)
            openEventNewTabElement.checked = res.openEventNewTab;
        else if (res.openEventNewTab == null || res.openEventNewTab == "undefined")
            openEventNewTabElement.checked = true;
    });
    openEventNewTabElement.addEventListener("input", () => {
        chrome.storage.sync.set({ openEventNewTab: openEventNewTabElement.checked });
    });
}

function handleOpenSearch()
{
    let openSearchNewTabElement = document.getElementById("openSearchNewTab");

    chrome.storage.sync.get("openSearchNewTab", (res) => {
        openSearchNewTabElement.checked = res.openSearchNewTab;
    });
    openSearchNewTabElement.addEventListener("input", () => {
        chrome.storage.sync.set({ openSearchNewTab: openSearchNewTabElement.checked });
    });
}

$(document).ready(function() {
    $(".toggler").click(() => {
        let drawer = document.getElementsByClassName("drawer")[0];
        if (drawer.style.width == "0px") {
            drawer.style.width = "20rem";
        } else
            drawer.style.width = "0px";
    });
    handleNotifySlider();
    handleBackgroundButtons();
    handleOpenEvent();
    handleOpenSearch();
});