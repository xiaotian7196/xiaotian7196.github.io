/*
    * @Author: Xiaotian7196
    * @Date: 2024-11-22 11:00:50
*/
let datetime = new Date();
let DateLocal = new Date().getTimezoneOffset();
let timezone = -DateLocal;
console.log(datetime)
console.log(timezone)
document.getElementById("time").textContent = datetime;
document.getElementById("timezone").textContent = timezone / 60;

function refreshTime() {
    const timeDisplay = document.getElementById("time");
    const dateString = new Date().toLocaleString();
    timeDisplay.textContent = dateString.replace(",", "-");
}

setInterval(refreshTime, 1000);

function secondToDate(second) {
    if (!second) {
        return 0;
    }
    let time = [0, 0, 0, 0, 0];
    if (second >= 365 * 24 * 3600) {
        time[0] = parseInt(second / (365 * 24 * 3600));
        second %= 365 * 24 * 3600;
    }
    if (second >= 24 * 3600) {
        time[1] = parseInt(second / (24 * 3600));
        second %= 24 * 3600;
    }
    if (second >= 3600) {
        time[2] = parseInt(second / 3600);
        second %= 3600;
    }
    if (second >= 60) {
        time[3] = parseInt(second / 60);
        second %= 60;
    }
    if (second > 0) {
        time[4] = second;
    }
    return time;
}

function time() {
    try {
        let create_time = Math.round(new Date(Date.UTC(2024, 3, 21, 0, 0, 0)).getTime() / 1000);
        let timestamp = Math.round((new Date().getTime() + 8 * 60 * 60 * 1000) / 1000);
        let currentTime = secondToDate((timestamp - create_time));
        document.getElementById("html_time").innerHTML = currentTime[0] + '年' + currentTime[1] + '天' + currentTime[2] + '时' + currentTime[3] + '分' + currentTime[4] + '秒';
    } catch (err) {
    }
}

setInterval(time, 1000);
// 你管我用try，我就用！

