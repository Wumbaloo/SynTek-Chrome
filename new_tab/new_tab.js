function update_photo()
{
    let request = new XMLHttpRequest();
    let photo_url;

    request.open("GET","https://api.pexels.com/v1/search?query=code+query&per_page=50&page=1",true);
    request.setRequestHeader("Authorization", "Bearer 563492ad6f91700001000001d0c29fc4d08b486e97db01e7a9aaa47d");
    try {
        request.send(null);
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (!request.responseText) {
                    photo_url = get_random_photos_offline();
                    document.body.style.backgroundSize = "100%";
                    document.body.style.backgroundImage = "url(" + photo_url + ")";
                    return;
                }
                let photos = JSON.parse(request.responseText)["photos"];
                let photo;
                if (photos) {
                    photo = photos[Math.floor(Math.random() * photos.length)];
                    photo_url = get_photo_url(photo);
                } else
                    photo_url = get_random_photos_offline();
                document.body.style.backgroundSize = "100%";
                document.body.style.backgroundImage = "url(" + photo_url + ")";
            }
        };
    } catch (exception) {
        photo_url = get_random_photos_offline();
        document.body.style.backgroundSize = "100%";
        document.body.style.backgroundImage = "url(" + photo_url + ")";
    }
}

function get_random_photos_offline()
{
    let photo = "../images/" + (1 + Math.floor(Math.random() * 10)) + ".jpg";

    return (photo);
}

function get_photo_url(photo)
{
    let url = photo["src"]["original"];

    url += "?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=" + window.innerHeight + "&w=" + window.innerWidth;
    return (url);
}

function start_clock() {
    let today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    document.getElementById('time').innerHTML = hours + ":" + minutes;
    setTimeout(start_clock, 10 * 1000);
}

function update_username(username)
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

function update_username_new_tab(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    let second = get_from_url("https://intra.epitech.eu/user/?format=json");
    second.onreadystatechange = function() {
        if (second.readyState === 4) {
            let answer = JSON.parse(second.responseText);
            let item = answer["firstname"];
            update_username(item);
        }
    };
    return ({});
}

function open_pexel() {
    chrome.tabs.create({
        url: "https://www.pexels.com/"
    });
}

function draw_registered(registered, scolar_year) {
    let table = document.getElementById("table_events");

    table.deleteRow(0);
    for (let i = 0; i < Object.keys(registered).length; i++) {
        let module = registered[i];
        let row = table.insertRow(0);
        let cell = row.insertCell(0);
        let title = module["acti_title"].split(" - ");
        if (title[1])
            cell.innerHTML = "<span style='color:#9b9b9b'> " + title[0] + " </span>" +  title[1] + " - ";
        else
            cell.innerHTML = "<span style='color:#9b9b9b'> " + title[0] + " </span> - ";
        cell.innerHTML += "<span style='color:#9b9b9b'> " + format_room_code(module["room"]["code"]) + " </span>";
        cell.innerHTML += " - " + time_of_module(module["start"]) + " to " + time_of_module(module["end"]).split(" ")[2];
        cell.style.textShadow = "1px 1px black";
        cell.style.textAlign = "center";
        cell.classList.add("module");
        cell.dataset.code = "https://intra.epitech.eu/module/" + scolar_year + "/" + module["codemodule"] + "/" + module["codeinstance"] + "/" + module["codeacti"] + "/";
    }
    if (Object.keys(registered).length === 0) {
        let row = table.insertRow(0);
        let cell = row.insertCell(0);
        cell.innerHTML = "No events for the next 7 days.";
        cell.style.textShadow = "1px 1px black";
        cell.style.textAlign = "center";
    }
}

function get_planning_new_tab(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            let profile = get_from_url("https://intra.epitech.eu/user/?format=json");
                profile.onreadystatechange = function () {
                    if (profile.readyState === 4) {
                        if (profile.status < 400) {
                            profile = JSON.parse(profile.responseText);
                            let second = get_from_url(get_url_of_week());
                            second.onreadystatechange = function () {
                                if (second.readyState === 4) {
                                    let answer = JSON.parse(second.responseText);
                                    if (answer.length > 0)
                                        answer.sort(sort_planning);
                                    $(".col-autologin").hide();
                                    $(".autologin_help").hide();
                                    $("#autologin_get").hide();
                                    $("#events").show();
                                    $(".welcome").show();
                                    draw_registered(get_next_registered(get_registered_from_planning(answer)), profile["scolaryear"]);
                                }
                            };
                        } else {
                            $(".col-autologin").show();
                            $(".autologin_help").show();
                            $("#autologin_get").show();
                            $("#events").hide();
                            $(".welcome").hide();
                    }
                };
            }
        }
    };
    return ({});
}

function get_autologin_link()
{
    let profile = get_from_url("https://intra.epitech.eu/admin/autolog?format=json");
    profile.onreadystatechange = function () {
        if (profile.status < 400) {
            let request = JSON.parse(profile.responseText);
            $(".autologin_help").text("Success! Just wait while we synchronize your calendar.");
            if (request["autologin"]) {
                chrome.storage.sync.set({autologin: request["autologin"]});
                chrome.storage.sync.get(["autologin"], function (res) {
                    get_planning_new_tab(res.autologin);
                });
            }
        } else {
            $(".autologin_help").text("Impossible to get the autologin link from epitech.eu");
        }
    };
}

update_photo();
document.getElementById("pexel_logo").addEventListener("click", open_pexel);

document.addEventListener("click", function(e) {
    if (!e.target["classList"].contains("intranet") && !e.target["classList"].contains("module")) {
        return;
    }
    if (e.target["classList"].contains("intranet"))
        open_planning();
    else if (e.target["classList"].contains("module"))
        show_event(e.target || e.srcElement);
});

$(document).ready(function() {
    start_clock();
    let row = document.getElementById("table_events").insertRow(0);
    let cell = row.insertCell(0);
    let found = false;
    cell.style.textAlign = "center";
    cell.innerHTML = "We're trying to recover your schedule..";
    chrome.storage.sync.get(["username"], function (res) {
        if (res.username) {
            found = true;
            update_username(res.username);
        }
    });
    chrome.storage.sync.get(["autologin"], function (res) {
        if (!found)
            update_username_new_tab(res.autologin);
        get_planning_new_tab(res.autologin);
    });
    document.getElementById("autologin_get").addEventListener("click", get_autologin_link);
    $("#events").fadeIn(2000);
    $(".welcome").fadeIn(2000);
});
