let planningNotification = "planning-notification";
let notifyMinutes = 15;

function getFromURL(url){
    let request = new XMLHttpRequest();
    request.open("GET", url,true);
    request.send(null);

    return request;
}

function updateNotifyMinutes(minutes) {
    if (Number(minutes) == "NaN")
        return;
    notifyMinutes = Number(minutes);
}

function daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function getWeekURL() {
    let actual = new Date();
    let actual_str = actual.getFullYear() + "-" + (actual.getMonth() + 1) + "-" + actual.getDate();
    let next = new Date(actual.setDate(actual.getDate() + 7));
    let days_month = daysInMonth(actual.getMonth(), actual.getFullYear());
    let next_str;
    if (next.getDate() > days_month) {
        next = new Date(actual.setMonth(actual.getMonth() + 1));
        next_str = next.getFullYear() + "-" + (next.getMonth()) + "-" + 7;
    } else
        next_str = next.getFullYear() + "-" + (next.getMonth() + 1) + "-" + next.getDate();

    return ("https://intra.epitech.eu/planning/load?format=json&start="+actual_str+"&end="+next_str);
}

function updatePlanning(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    let second = getFromURL(getWeekURL());
    second.onreadystatechange = function() {
        if (second.readyState === 4) {
            let answer = JSON.parse(second.responseText);
            checkNotifications(getRegisteredFromPlanning(answer));
        }
    };
}

function getPlanning(autologin)
{
    let request = new XMLHttpRequest();
    let promise = new Promise((resolve, reject) => {
        request.open("GET", autologin,true);
        request.withCredentials = true;
        request.send();
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                let profile = getFromURL("https://intra.epitech.eu/user/?format=json");
                profile.onreadystatechange = () => {
                    if (profile.readyState === 4) {
                        if (profile.status < 400) {
                            profile = JSON.parse(profile.responseText);
                            let second = getFromURL(getWeekURL());
                            second.onreadystatechange = () => {
                                if (second.readyState === 4) {
                                    let answer = JSON.parse(second.responseText);
                                    if (answer.length > 0)
                                        answer.sort(sortPlanning);
                                    resolve({data: answer, scolarYear: profile["scolaryear"]});
                                }
                            };
                        } else {
                            reject(Error("Can't retrieve planning, are you logged on intra.epitech.eu ?"));
                        }
                    };
                }
            }
        };
    });

    return (promise);
}

function drawRegistered(table, registered, scolar_year, days) {
    table.deleteRow(0);
    for (let i = 0; i < Object.keys(registered).length; i++) {
        let module = registered[i];
        let row = table.insertRow(0);
        let cell = row.insertCell(0);
        let title = module["acti_title"].split(" - ");
        let titleElem = document.createElement("span");
        titleElem.style.color = "#9b9b9b";
        if (title[1])
            titleElem.innerHTML = title[0] + " " +  title[1];
        else
            titleElem.innerHTML = title[0];
        titleElem.style.pointerEvents = "none";
        cell.appendChild(titleElem);
        cell.innerHTML += " - <span style='color:#9b9b9b; pointer-events: none'> " + formatRoomCode(module["room"]["code"]) + " </span>";
        cell.innerHTML += " - " + getModuleTime(module["start"]) + " to " + getModuleTime(module["end"]).split(" ")[2];
        cell.style.textShadow = "1px 1px black";
        cell.style.textAlign = "center";
        cell.classList.add("module");
        cell.dataset.code = "https://intra.epitech.eu/module/" + scolar_year + "/" + module["codemodule"] + "/" + module["codeinstance"] + "/" + module["codeacti"] + "/";
    }
    if (Object.keys(registered).length === 0) {
        let row = table.insertRow(0);
        let cell = row.insertCell(0);
        cell.innerHTML = "No events for the next " + (days == 1 ? "24 hours." : days + " days.");
        cell.style.textShadow = "1px 1px black";
        cell.style.textAlign = "center";
    }
}

function getRegisteredFromPlanning(planning)
{
    let registered = {};
    let index = 0;

    for (let i = 0 ; i < planning.length; i++) {
        if (planning[i]["event_registered"] === "registered") {
            registered[index] = planning[i];
            index++;
        }
    }
    return (registered);
}

function sortPlanning(a, b)
{
    return new Date(b["start"]).getTime() - new Date(a["start"]).getTime();
}

function getNextEventsByDays(planning, days)
{
    let date = new Date();
    let comming = {};
    let index = 0;

    for (let i = 0 ; i < Object.keys(planning).length; i++) {
        let module = planning[i]["start"];
        let module_date = module.split(" ")[0].split("-");
        let module_time = module.split(" ")[1].split(":");
        if (parseInt(module_date[1]) === date.getMonth() + 2) {
            if (days) {
                let days_month = daysInMonth(date.getMonth(), date.getFullYear());
                if ((days_month - date.getDate()) + parseInt(module_date[2]) <= days)
                    comming[index++] = planning[i];
            } else
                comming[index++] = planning[i];
        } else if (parseInt(module_date[2]) >= date.getDate()) {
            if (parseInt(module_date[2]) === date.getDate()) {
                if (parseInt(module_time[0]) > date.getHours())
                    comming[index++] = planning[i];
                else if (parseInt(module_time[0]) === date.getHours()) {
                    if (parseInt(module_time[1]) >= date.getMinutes())
                        comming[index++] = planning[i];
                }
            } else {
                if (!days)
                    comming[index++] = planning[i];
                if (parseInt(module_date[2]) - days <= date.getDate())
                    comming[index++] = planning[i];
            }
        }
    }
    return (comming);
}

function formatRoomCode(room_code)
{
    if (!room_code || room_code.length == 0)
        return ("No room assigned");
    let splitted = room_code.split("/");
    return (splitted[splitted.length - 1]);
}

function getModuleTime(module)
{
    let end_string = "";
    let date = new Date();
    let module_date = module.split(" ")[0].split("-");
    let module_time = module.split(" ")[1].split(":");

    let days = parseInt(module_date[2]) - date.getDate();
    if (parseInt(module_date[1]) === date.getMonth() + 2) {
        let days_month = daysInMonth(date.getMonth(), date.getFullYear());
        days = (days_month - date.getDate()) + parseInt(module_date[2]);
    }
    if (days === 0) {
        end_string += "Today from ";
    } else if (days === 1) {
        end_string += "Tomorrow from ";
    } else {
        end_string += "J-" + days.toString() + " from ";
    }
    end_string += module_time[0] + ":" + module_time[1];
    return (end_string);
}

function showEvent(element) {
    chrome.storage.sync.get("openEventNewTab", (res) => {
        if (res.openEventNewTab) {
            chrome.tabs.create({
                url: element.dataset.code
            });
        } else
            window.location = element.dataset.code;
    });
}

function checkNotifications(events)
{
    notifyEvents(events);
    setTimeout(checkNotifications, 60 * 2000, events);
}

function notifyEvents(event) {
    for (let i = 0; i < Object.keys(event).length; i++) {
        let date = new Date();
        let time = event[i]["start"];
        let module_date = time.split(" ")[0].split("-");
        let module_time = time.split(" ")[1].split(":");
        if (parseInt(module_date[2]) - date.getDate() === 0) {
            if (parseInt(module_time[0] - 1) === date.getHours()) {
                let time = 60 + parseInt((module_time[1])) - date.getMinutes();
                if (time <= notifyMinutes) {
                    chrome.notifications.create(planningNotification, {
                        "type": "basic",
                        "iconUrl": chrome.extension.getURL("icons/icon-64.png"),
                        "title": event[i]["acti_title"],
                        "message": "Starts in " + (time).toString() + " minutes in " + formatRoomCode(event[i]["room"]["code"])
                    });
                }
            }
        }
    }
}

chrome.storage.sync.get(["autologin"], function (res) {
    updatePlanning(res.autologin);
});
