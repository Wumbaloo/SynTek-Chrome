function open_planning() {
  chrome.tabs.create({
    url: "https://intra.epitech.eu/planning/"
  });
}

function draw_registered_popup(registered, scolar_year) {
    let table = document.getElementById("events");

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
        cell.classList.add("event");
        cell.dataset.code = "https://intra.epitech.eu/module/" + scolar_year + "/" + module["codemodule"] + "/" + module["codeinstance"] + "/" + module["codeacti"] + "/";
    }
    if (Object.keys(registered).length === 0) {
        let row = table.insertRow(0);
        let cell = row.insertCell(0);
        cell.innerHTML = "No events for the next 24 hours";
        cell.style.textShadow = "1px 1px black";
        cell.style.textAlign = "center";
    }
}

function get_planning_popup(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    let profile = get_from_url("https://intra.epitech.eu/user/?format=json");
    profile.onreadystatechange = function() {
        if (profile.readyState === 4) {
            profile = JSON.parse(profile.responseText);
            let second = get_from_url(get_url_of_week());
            second.onreadystatechange = function() {
                if (second.readyState === 4) {
                    let answer = JSON.parse(second.responseText);
                    answer.sort(sort_planning);
                    draw_registered_popup(get_next_registered(get_registered_from_planning(answer), 1), profile["scolaryear"]);
                }
            };
        }
    };
    return ({});
}

function load_page() {
    let row = document.getElementById("events").insertRow(0);
    let cell = row.insertCell(0);
    cell.style.marginLeft = "25px";
    cell.innerHTML = "We're trying to recover your schedule..";
    chrome.storage.sync.get(["autologin"], function (res) {
        get_planning_popup(res.autologin);
    });
    $("#body").fadeIn(2000);
}

document.addEventListener("click", function(e) {
    if (!e.target.classList.contains("intranet") && !e.target.classList.contains("event")) {
        return;
    }

    if (e.target.classList.contains("intranet"))
        open_planning();
    else if (e.target.classList.contains("event"))
        show_event(e.target || e.srcElement);
});

document.addEventListener('DOMContentLoaded', load_page);
