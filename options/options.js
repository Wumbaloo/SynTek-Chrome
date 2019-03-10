function saveOptions(e) {
    e.preventDefault();
    chrome.storage.sync.set({ username: document.querySelector("#username").value});
    chrome.storage.sync.set({ autologin: document.querySelector("#autologin").value});
}

function restoreOptions() {
    chrome.storage.sync.get(["username"], function (res) {
        document.querySelector("#username").value = res.username || "";
    });
    chrome.storage.sync.get(["autologin"], function (res) {
        document.querySelector("#autologin").value = res.autologin || "";
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
