let planningNotification = "planning-notification";

function get_from_url(url){
    let request = new XMLHttpRequest();
    request.open("GET", url,true);
    request.send(null);

    return request;
}

function days_in_month(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function get_url_of_week() {
    let actual = new Date();
    let actual_str = actual.getFullYear() + "-" + (actual.getMonth() + 1) + "-" + actual.getDate();
    let next = new Date(actual.setDate(actual.getDate() + 7));
    let days_month = days_in_month(actual.getMonth(), actual.getFullYear());
    let next_str;
    if (next.getDate() > days_month) {
        next = new Date(actual.setMonth(actual.getMonth() + 1));
        next_str = next.getFullYear() + "-" + (next.getMonth()) + "-" + 7;
    } else
        next_str = next.getFullYear() + "-" + (next.getMonth() + 1) + "-" + next.getDate();

    return ("https://intra.epitech.eu/planning/load?format=json&start="+actual_str+"&end="+next_str);
}

function get_planning(autologin)
{
    let request = new XMLHttpRequest();
    request.open("GET", autologin,true);
    request.withCredentials = true;
    request.send();
    let second = get_from_url(get_url_of_week());
    second.onreadystatechange = function() {
        if (second.readyState === 4) {
            let answer = JSON.parse(second.responseText);
            check_notifications(get_registered_from_planning(answer));
        }
    };
}

function get_registered_from_planning(planning)
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

function sort_planning(a, b)
{
    return new Date(b["start"]).getTime() - new Date(a["start"]).getTime();
}

function get_next_registered(planning, days)
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
                let days_month = days_in_month(date.getMonth(), date.getFullYear());
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

function format_room_code(room_code)
{
    if (!room_code)
        return ("No room assigned");
    let splitted = room_code.split("/");
    return (splitted[splitted.length - 1]);
}

function time_of_module(module)
{
    let end_string = "";
    let date = new Date();
    let module_date = module.split(" ")[0].split("-");
    let module_time = module.split(" ")[1].split(":");

    let days = parseInt(module_date[2]) - date.getDate();
    if (parseInt(module_date[1]) === date.getMonth() + 2) {
        let days_month = days_in_month(date.getMonth(), date.getFullYear());
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

function show_event(element) {
    chrome.tabs.create({
        url: element.dataset.code
    });
}

function check_notifications(events)
{
    notify_events(events);
    setTimeout(check_notifications, 60 * 2000, events);
}

function notify_events(event) {
    for (let i = 0; i < Object.keys(event).length; i++) {
        let date = new Date();
        let time = event[i]["start"];
        let module_date = time.split(" ")[0].split("-");
        let module_time = time.split(" ")[1].split(":");
        if (parseInt(module_date[2]) - date.getDate() === 0) {
            if (parseInt(module_time[0] - 1) === date.getHours()) {
                let time = 60 + parseInt((module_time[1])) - date.getMinutes();
                if (time <= 15) {
                    chrome.notifications.create(planningNotification, {
                        "type": "basic",
                        "iconUrl": chrome.extension.getURL("icons/icon-64.png"),
                        "title": event[i]["acti_title"],
                        "message": "Starts in " + (time).toString() + " minutes in " + format_room_code(event[i]["room"]["code"])
                    });
                }
            }
        }
    }
}

chrome.storage.sync.get(["autologin"], function (res) {
    get_planning(res.autologin);
});
