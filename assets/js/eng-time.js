var datetime = new Date();
var datelocal = new Date().getTimezoneOffset();
var timezone = -datelocal;
console.log(datetime)
document.getElementById("time").textContent=datetime;
document.getElementById("timezone").textContent=timezone/60;

function refreshTime(){
    const timeDisplay = document.getElementById("time");
    const dateString = new Date().toLocaleString();
    const formattedString = dateString.replace(",","-");
    timeDisplay.textContent = formattedString;
                     }
                     setInterval(refreshTime,1000);
                     
function refreshTime(){
    const timeDisplay = document.getElementById("time");
    const dateString = new Date().toLocaleString();
    const formattedString = dateString.replace(",","-");
    timeDisplay.textContent = formattedString;
                     }
                     setInterval(refreshTime,1000);




    function secondToDate(second) {
        if (!second) {
            return 0;
        }
        var time = new Array(0, 0, 0, 0, 0);
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
    function setTime() {
        var create_time = Math.round(new Date(Date.UTC(2024, 01, 21, 0, 0, 0)).getTime() / 1000);
        var timestamp = Math.round((new Date().getTime() + 8 * 60 * 60 * 1000) / 1000);
        currentTime = secondToDate((timestamp - create_time));
        currentTimeHtmlENG = currentTime[0] + ' YEAR ' + currentTime[1] + ' DAY '
                + currentTime[2] + ' HOUR ' + currentTime[3] + ' MIN ' + currentTime[4]
                + ' SEC ';
        document.getElementById("htmer_time_ENG").innerHTML = currentTimeHtmlENG;
    }    
    
    
    
    setInterval(setTime, 1000);