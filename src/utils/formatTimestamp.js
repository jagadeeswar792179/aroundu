export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();

  // Helper → format time (5:50 AM → 5:50am)
  const formatTime = (d) => {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12; // convert 0 → 12
    return `${hours}:${minutes}${ampm}`;
  };

  // Check if same day
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return formatTime(date); // 5:50am
  }

  // Format date → 3 July
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });

  return `${day} ${month}, ${formatTime(date)}`;
};
