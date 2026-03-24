let nav = 0;
let clicked = null;
let events = [];
const API_URL = "../api.php";

const calendar = document.getElementById("calendar");
const newEventModal = document.getElementById("newEventModal");
const backDrop = document.getElementById("modalBackDrop");
const eventTitleInput = document.getElementById("eventTitleInput");
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function openModal(date) {
  clicked = date;

  const eventForDay = events.find((e) => e.date == clicked);
  if (eventForDay) {
    console.log("event already exists");
  } else {
    newEventModal.style.display = "block";
    backDrop.style.display = "block";
  }
}

function load() {
  const dt = new Date();

  if (nav !== 0) {
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

  document.getElementById("monthDisplay").innerText =
    `${dt.toLocaleDateString("en-us", { month: "long" })} ${year}`;

  calendar.innerHTML = " ";

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daysquare = document.createElement("div");
    daysquare.classList.add("day");

    if (i > paddingDays) {
      const dayNum = i - paddingDays;
      daysquare.innerText = dayNum;

      const dayEvents = events.filter(
        (e) => e.date === `${dayNum}/${month + 1}/${year}`,
      );
      if (dayEvents.length > 0) {
        dayEvents.forEach((event) => {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");

          const vacationNames = [
            "Herfstvakantie",
            "Kerstvakantie",
            "Voorjaarsvakantie",
            "Pasen",
            "Meivakantie",
            "Pinksteren",
            "Zomervakantie",
          ];

          const specialWeekNames = [
            "Project-week 3",
            "Project-week 4",
            "Bootcamp 3",
            "Snuffel-stage",
            "VEEGWEEK",
            "laatste week",
          ];

          if (vacationNames.includes(event.title)) {
            eventDiv.classList.add("vacation");
          } else if (specialWeekNames.includes(event.title)) {
            eventDiv.classList.add("specialweek");
          }

          eventDiv.innerText = event.title;
          daysquare.appendChild(eventDiv);
        });
      }

      daysquare.addEventListener("click", () =>
        console.log(openModal(`${dayNum}/${month + 1}/${year}`)),
      );
    } else {
      daysquare.classList.add("padding");
    }

    calendar.appendChild(daysquare);
  }
}

function closeModal() {
  eventTitleInput.classList.remove("error");
  newEventModal.style.display = "none";
  backDrop.style.display = "none";
  eventTitleInput.value = "";
  clicked = null;
  load();
}

function saveModal() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove("error");

    // Send event to API
    fetch(`${API_URL}?action=addEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: clicked,
        title: eventTitleInput.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          events.push({
            date: data.date,
            title: data.title,
            id: data.id,
          });

          eventTitleInput.classList.remove("error");
          newEventModal.style.display = "none";
          backDrop.style.display = "none";
          eventTitleInput.value = "";
          clicked = null;
          load();
        } else {
          console.error("Error saving event:", data.error);
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    eventTitleInput.classList.add("error");
  }
}

function initButtons() {
  document.getElementById("nextButton").addEventListener("click", () => {
    nav++;
    load();
  });

  document.getElementById("backButton").addEventListener("click", () => {
    nav--;
    load();
  });

  document.getElementById("saveButton").addEventListener("click", saveModal);
  document.getElementById("cancelButton").addEventListener("click", closeModal);
}

async function initializeVacationsAndEvents() {
  try {
    // Fetch events from API
    const response = await fetch(`${API_URL}?action=getEvents`);
    events = await response.json();

    // If no events exist, initialize them
    if (events.length === 0) {
      const initResponse = await fetch(`${API_URL}?action=initializeEvents`, {
        method: "POST",
      });
      const initData = await initResponse.json();

      if (initData.success || initData.message) {
        console.log("Events initialized:", initData);
        // Fetch again to get the initialized events
        const refreshResponse = await fetch(`${API_URL}?action=getEvents`);
        events = await refreshResponse.json();
      }
    }

    load();
  } catch (error) {
    console.error("Error initializing events:", error);
  }
}
initializeVacationsAndEvents();
initButtons();
