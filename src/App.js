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
  return (
<div style={{
  background: '#18181b',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: 32,
  paddingBottom: 32,
}}>
  {mockDays.map(({ date, events, isToday }) => (
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
  );
}

export default App;
