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
