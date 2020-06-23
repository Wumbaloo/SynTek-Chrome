function getRandomOfflineBackground()
{
    let photo = "../images/" + (1 + Math.floor(Math.random() * 10)) + ".jpg";

    return (photo);
}

function getPhotoURL(photo)
{
    let url = photo["src"]["original"];

    url += "?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=" + window.innerHeight + "&w=" + window.innerWidth;
    return (url);
}

function updateBackground()
{
    let request = new XMLHttpRequest();
    let photo_url;

    chrome.storage.sync.get("background", (res) => {
        if (res.background) {
            document.body.style.backgroundImage = res.background;
        } else {
            request.open("GET","https://api.pexels.com/v1/search?query=code+query&per_page=50&page=1",true);
            request.setRequestHeader("Authorization", "Bearer 563492ad6f91700001000001d0c29fc4d08b486e97db01e7a9aaa47d");
            try {
                request.send(null);
                request.onreadystatechange = function() {
                    if (request.readyState === 4) {
                        if (!request.responseText) {
                            photo_url = getRandomOfflineBackground();
                            document.body.style.backgroundImage = "url(" + photo_url + ")";
                            return;
                        }
                        let photos = JSON.parse(request.responseText)["photos"];
                        let photo;
                        if (photos) {
                            photo = photos[Math.floor(Math.random() * photos.length)];
                            photo_url = getPhotoURL(photo);
                        } else
                            photo_url = getRandomOfflineBackground();
                        document.body.style.backgroundImage = "url(" + photo_url + ")";
                    }
                };
            } catch (exception) {
                photo_url = getRandomOfflineBackground();
                document.body.style.backgroundImage = "url(" + photo_url + ")";
            }
        }
    });
}

function startClock() {
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    document.getElementById('time').innerHTML = hours + ":" + minutes;
    setTimeout(startClock, 10 * 1000);
}

function updateWelcomeText(username)
{
    let txt = "Good Morning, " + username + ".";
    let date = new Date();

    if (date.getHours() >= 12)
        txt = "Good Afternoon, " + username + ".";
    if (date.getHours() >= 18)
        txt = "Good Evening, " + username + ".";
    if ((date.getHours() >= 23 && date.getMinutes() >= 42) || date.getHours() <= 8)
        txt = "Epitech is closed, go to sleep already!!!";
    document.getElementsByClassName("welcome")[0].innerHTML = txt;
}

function updateUsername(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    let second = getFromURL("https://intra.epitech.eu/user/?format=json");
    second.onreadystatechange = function() {
        if (second.readyState === 4) {
            let answer = JSON.parse(second.responseText);
            let item = answer["firstname"];
            updateWelcomeText(item);
        }
    };
    return ({});
}

function openPexelURL() {
    chrome.tabs.create({
        url: "https://www.pexels.com/"
    });
}

function openIntraEpitech() {
    window.location = "https://intra.epitech.eu/";
}

function retrievePlanningNewTab(autologin)
{
    getPlanning(autologin)
    .then((answer) => {
        $(".col-autologin").hide();
        $("#events").show();
        $(".welcome").show();
        drawRegistered(document.getElementById("table_events"), getNextEventsByDays(getRegisteredFromPlanning(answer.data)), answer.scolarYear, 7);
    })
    .catch((error) => {
        console.log(error);
        $(".col-autologin").show();
        $('.col-autologin').css({
            "display": "flex",
            "flex-direction": "column",
            "align-items": "center"
        });
        $("#events").hide();
        $(".welcome").hide();
    });
}

function trySyncAutologin()
{
    let profile = getFromURL("https://intra.epitech.eu/admin/autolog?format=json");
    profile.onreadystatechange = () => {
        if (profile.status < 400) {
            let request = JSON.parse(profile.responseText);
            $(".autologin_help").text("Success! Just wait while we synchronize your calendar.");
            if (request["autologin"]) {
                chrome.storage.sync.set({autologin: request["autologin"]});
                chrome.storage.sync.get(["autologin"], function (res) {
                    retrievePlanningNewTab(res.autologin);
                });
            }
        } else {
            $(".autologin_help").text("Impossible to get the autologin link from epitech.eu");
        }
    };
}

document.addEventListener("click", function(e) {
    if (!e.target["classList"].contains("intranet") && !e.target["classList"].contains("module")) {
        return;
    }
    if (e.target["classList"].contains("intranet"))
        open_planning();
    else if (e.target["classList"].contains("module"))
        showEvent(e.target || e.srcElement);
});

function fadeElements()
{
    $("#events").fadeIn(2000);
    $("#time").fadeIn(2000);
    $(".welcome").fadeIn(2000);
    $(".searchbox-container").fadeIn(2000);
}

function updateWelcome()
{
    let found = false;

    chrome.storage.sync.get(["username"], function (res) {
        if (res.username) {
            found = true;
            updateWelcomeText(res.username);
        }
    });
    chrome.storage.sync.get(["autologin"], function (res) {
        if (!found)
            updateUsername(res.autologin);
        retrievePlanningNewTab(res.autologin);
    });
    document.getElementById("autologin_get").addEventListener("click", trySyncAutologin);
}

$(document).ready(function() {
    startClock();
    updateWelcome();
    let row = document.getElementById("table_events").insertRow(0);
    let cell = row.insertCell(0);
    cell.style.textAlign = "center";
    cell.innerHTML = "We're trying to recover your schedule..";

    updateBackground();
    fadeElements();
    document.getElementById("pexel_logo").addEventListener("click", openPexelURL);
    document.getElementsByClassName("search-input")[0].addEventListener("keydown", (event) => {
        if (event.keyCode != 13)
            return;
        launchSearch();
        event.preventDefault();
    });
    $('.search-input').focus();
    $(".search-go").click(launchSearch);
    $(".gotoIntra").click(openIntraEpitech);
});