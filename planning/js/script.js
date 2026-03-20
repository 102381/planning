let nav = 0;
let clicked = null;
let events = localStorage.getItem("events") ? JSON.parse(localStorage.getItem("events")) : [];

const calendar = document.getElementById("calendar");
const newEventModal = document.getElementById('newEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function openModal(date){
  clicked = date;

  const eventForDay = events.find(e => e.date == clicked)
  if (eventForDay) {
    console.log('event already exists');
  } else {
    newEventModal.style.display = 'block';
    backDrop.style.display = 'block'
  }
}

function load() {
  const dt = new Date();

    if(nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }



  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayofMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayofMonth.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const paddingDays = weekdays.indexOf(dateString.split(", ")[0]);
  
  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', { month:"long"})} ${year}`;

  calendar.innerHTML = ' ';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daysquare = document.createElement("div");
    daysquare.classList.add("day");

    if (i > paddingDays) {
        const dayNum = i - paddingDays;
        daysquare.innerText = dayNum;

   
        const dayEvents = events.filter(e => e.date === `${dayNum}/${month + 1}/${year}`);
        if (dayEvents.length > 0) {
          dayEvents.forEach(event => {
            const eventDiv = document.createElement("div");
            eventDiv.classList.add("event");
        
            const vacationNames = ["Herfstvakantie", "Kerstvakantie", "Voorjaarsvakantie", "Pasen", "Meivakantie", "Pinksteren", "Zomervakantie"];
            if (vacationNames.includes(event.title)) {
              eventDiv.classList.add("vacation");
            }
            
            eventDiv.innerText = event.title;
            daysquare.appendChild(eventDiv);
          });
        }

        daysquare.addEventListener('click', () => console.log(openModal(`${dayNum}/${month + 1}/${year}`)));
    } else {
      daysquare.classList.add("padding");
    }

    calendar.appendChild(daysquare);
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error')
  newEventModal.style.display = 'none';
  backDrop.style.display = 'none'
  eventTitleInput.value = '';
  clicked = null;
  load();
}


function saveModal() {
 if (eventTitleInput.value) {  
 eventTitleInput.classList.remove('error')

 events.push({
  date: clicked,
  title: eventTitleInput.value,
 });

 localStorage.setItem('events', JSON.stringify(events));

  eventTitleInput.classList.remove('error');
 newEventModal.style.display = 'none';
 backDrop.style.display = 'none';
 eventTitleInput.value = '';
 clicked = null;
 load();

 } else {
  eventTitleInput.classList.add('error');
 }
}

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();

  });

   document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });
 
document.getElementById('saveButton').addEventListener('click', saveModal);
 document.getElementById('cancelButton').addEventListener('click', closeModal);
}

function initializeVacationsAndEvents() {
  if (events.length > 0) return;

  const vacations = [
    { name: "Herfstvakantie", start: "2026-10-17", end: "2026-10-25" },
    { name: "Kerstvakantie", start: "2026-12-19", end: "2027-01-03" },
    { name: "Voorjaarsvakantie", start: "2027-02-20", end: "2027-02-28" },
    { name: "Pasen", start: "2027-03-26", end: "2027-03-29" },
    { name: "Meivakantie", start: "2027-04-24", end: "2027-05-09" },
    { name: "Pinksteren", start: "2027-05-17", end: "2027-05-17" },
    { name: "Zomervakantie", start: "2027-07-17", end: "2027-08-29" },
  ];


  vacations.forEach(vacation => {
    const start = new Date(vacation.start);
    const end = new Date(vacation.end);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      events.push({
        date: `${day}/${month}/${year}`,
        title: vacation.name,
      });
    }
  });


  for (let date = new Date("2026-01-01"); date <= new Date("2027-12-31"); date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 3) { 
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      events.push({
        date: `${day}/${month}/${year}`,
        title: "Online les",
      });
    }
  }


  for (let date = new Date("2026-01-01"); date <= new Date("2027-12-31"); date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 5) { 
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      events.push({
        date: `${day}/${month}/${year}`,
        title: "Blink meetup",
      });
    }
  }

  localStorage.setItem('events', JSON.stringify(events));
}

initializeVacationsAndEvents();
initButtons() 
load();
