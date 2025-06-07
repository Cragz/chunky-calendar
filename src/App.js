

import { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "1013191306867-g0kqodnnua8gvli3tdkdak3o4g56hf5e.apps.googleusercontent.com"; // <-- paste from Google
const API_KEY = ""; // Not strictly needed
const CALENDAR_ID = "ka4epql12mofgus7h2c8gfemes@group.calendar.google.com"; // Or the email of your shared calendar
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";


const mockDays = [
  {
    date: new Date(2025, 5, 9),   // Monday, 9 June 2025
    events: [{ summary: "Gym with Alex" }],
    isToday: true,
  },
  {
    date: new Date(2025, 5, 10),
    events: [{ summary: "Yoga class" }],
    isToday: false,
  },
  {
    date: new Date(2025, 5, 11),
    events: [
      { summary: "Grocery shop" },
      { summary: "Run 5k" },
      { summary: "Laundry" },
    ],
    isToday: false,
  },
  {
    date: new Date(2025, 5, 12),
    events: [],
    isToday: false,
  },
  {
    date: new Date(2025, 5, 13),
    events: [],
    isToday: false,
  },
];

const iconMap = [
  { keyword: "gym", icon: "🏋️" },
  { keyword: "yoga", icon: "🧘" },
  { keyword: "shop", icon: "🛒" },
  { keyword: "run", icon: "🏃" },
  { keyword: "laundry", icon: "🧺" },
];

function getIconForEvent(event) {
  const lc = event.summary.toLowerCase();
  for (const { keyword, icon } of iconMap) {
    if (lc.includes(keyword)) return icon;
  }
  return "📌";
}



function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
const [events, setEvents] = useState([]);

useEffect(() => {
  function start() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
      ],
      scope: SCOPES,
    }).then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(setIsSignedIn);
      // Handle the initial sign-in state.
      setIsSignedIn(gapi.auth2.getAuthInstance().isSignedIn.get());
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        listUpcomingEvents();
      }
    });
  }
  gapi.load("client:auth2", start);
}, []);

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

function listUpcomingEvents() {
  const now = new Date();
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(now.getDate() + 4);

  gapi.client.calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: now.toISOString(),
    timeMax: fiveDaysLater.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: "startTime",
  }).then(response => {
    setEvents(response.result.items || []);
  });
}

function groupEventsByDay(events) {
  const days = [];
  const now = new Date();
  // Get the next 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dayString = date.toISOString().split('T')[0];
    // Filter events for this day
    const eventsForDay = (events || []).filter(event => {
      // Handle all-day vs timed events
      const start = event.start.date || event.start.dateTime;
      const eventDay = (new Date(start)).toISOString().split('T')[0];
      return eventDay === dayString;
    });
    days.push({
      date,
      events: eventsForDay,
      isToday: i === 0
    });
  }
  return days;
}

const days = groupEventsByDay(events);

return (
  <div style={{ background: "#18181b", minHeight: "100vh", color: "white" }}>
    {!isSignedIn ? (
      <button onClick={handleAuthClick} style={{
        fontSize: 24, marginBottom: 16, padding: "8px 20px", borderRadius: 12
      }}>
        Sign in with Google
      </button>
    ) : (
      <button onClick={handleSignoutClick} style={{
        fontSize: 18, marginBottom: 16, padding: "6px 18px", borderRadius: 10
      }}>
        Sign out
      </button>
    )}

    {/* Only show the calendar UI if signed in */}
    {isSignedIn && (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 32
      }}>
        {days.map(({ date, events, isToday }) => (
          <div
            key={date}
            style={{
              width: 400,
              maxWidth: '95vw',
              padding: 28,
              borderRadius: 24,
              marginBottom: 28,
              background: '#27272a',
              border: isToday ? '4px solid #60a5fa' : '2px solid #262626',
              boxShadow: '0 2px 16px #000c',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
              {date.toLocaleDateString("en-GB", {
                weekday: "long", day: "numeric", month: "long"
              })}
            </div>
            <div style={{ fontSize: 18, color: "#d4d4d8", marginBottom: 16 }}>
              {date.toLocaleDateString("en-GB")}
            </div>
            {events.length === 0 ? (
              <div style={{ fontSize: 26, color: "#52525b" }}>Nothing planned!</div>
            ) : (
              events.map((event, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 28,
                    marginBottom: 10,
                    color: "white"
                  }}
                >
                  <span style={{ marginRight: 18 }}>{getIconForEvent(event)}</span>
                  <span>{event.summary}</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
}

export default App;
