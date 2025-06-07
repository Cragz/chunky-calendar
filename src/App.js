import { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "1013191306867-g0kqodnnua8gvli3tdkdak3o4g56hf5e.apps.googleusercontent.com"; // <-- paste from Google
const API_KEY = ""; // Not strictly needed
const CALENDAR_ID = "cf2f2ec4a1b3d0c768d372daf052ae8006fe5c673ac6bba9722ce9599b45a4b6@group.calendar.google.com"; // Or the email of your shared calendar
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const cardColors = ["#a7f3d0", "#fde68a", "#bfdbfe", "#fbcfe8", "#fca5a5"]; // mint, yellow, blue, pink, red
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
  { keyword: "run", icon: "🏃" },
  { keyword: "bike", icon: "🚴" },
  { keyword: "cycle", icon: "🚴" },
  { keyword: "walk", icon: "🚶" },
  { keyword: "steps", icon: "🚶" },
  { keyword: "workout", icon: "💪" },
  { keyword: "clean", icon: "🧹" },
  { keyword: "tidy", icon: "🧹" },
  { keyword: "rest", icon: "🛌" },
  { keyword: "shop", icon: "🛒" },
  { keyword: "supermarket", icon: "🛒" },
  { keyword: "meal", icon: "🍽️" },
  { keyword: "eat out", icon: "🍽️" },
  { keyword: "date", icon: "💖" },
  { keyword: "movie", icon: "🎬" },
  { keyword: "pub", icon: "🍺" },
  { keyword: "drinks", icon: "🍻" },
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
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.width = "100%";
    document.body.style.width = "100%";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
  }, []);

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
    <div style={{ background: "#18181b", minHeight: "100vh", width: "100vw", overflowX: "hidden", color: "white" }}>
      {/* Only show the calendar UI if signed in */}
      {isSignedIn && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 32,
          paddingBottom: 32
        }}>
          {days.map(({ date, events, isToday }, dayIdx) => (
            <div
              key={date}
              style={{
                width: "100%",
                maxWidth: 400,
                boxSizing: "border-box",
                padding: 28,
                borderRadius: 24,
                marginBottom: 28,
                background: '#27272a',
                border: isToday ? '4px solid #60a5fa' : '2px solid #262626',
                boxShadow: '0 2px 16px #000c',
              }}
            >
              {/* LINE 1: Big bold day name or "Today" */}
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 2 }}>
                {isToday
                  ? "Today"
                  : date.toLocaleDateString("en-GB", { weekday: "long" })}
              </div>

              {/* LINE 2: Small, dd-mmm */}
              <div style={{ fontSize: 18, color: "#d4d4d8", marginBottom: 16 }}>
                {date
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                  .replace('.', '')} {/* Remove trailing dot if present */}
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
      <div style={{
        position: "fixed",
        bottom: 18,
        width: "100vw",
        textAlign: "center",
        zIndex: 10,
        pointerEvents: "none"
      }}>
        <span
          onClick={isSignedIn ? handleSignoutClick : handleAuthClick}
          style={{
            color: "#b6bac2",
            textDecoration: "underline",
            fontSize: 16,
            cursor: "pointer",
            opacity: 0.7,
            pointerEvents: "auto"
          }}
        >
          {isSignedIn ? "Sign out" : "Sign in"}
        </span>
      </div>

    </div>
  );
}

export default App;
