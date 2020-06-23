function openPlanningURL() {
  chrome.tabs.create({
    url: "https://intra.epitech.eu/planning/"
  });
}

function loadEventsPopup() {
    let row = document.getElementById("events").insertRow(0);
    let cell = row.insertCell(0);
    cell.style.marginLeft = "25px";
    cell.innerHTML = "We're trying to recover your schedule..";
    chrome.storage.sync.get(["autologin"], function (res) {
        getPlanning(res.autologin)
        .then((answer) => {
            drawRegistered(document.getElementById("events"), getNextEventsByDays(getRegisteredFromPlanning(answer.data), 1), answer.scolarYear, 1);
        })
        .catch((error) => {
            console.log(error);
        });
    });
    $("#body").fadeIn(2000);
}

document.addEventListener("click", function(e) {
    if (!e.target.classList.contains("intranet") && !e.target.classList.contains("event")) {
        return;
    }
    if (e.target.classList.contains("intranet"))
        openPlanningURL();
    else if (e.target.classList.contains("event"))
        showEvent(e.target || e.srcElement);
});

document.addEventListener('DOMContentLoaded', loadEventsPopup);
