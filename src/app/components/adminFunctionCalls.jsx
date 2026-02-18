// Format date function
export function Button({ label, fnClose, bool }) {
  return (
    <button
      className="bg-admin-aqua text-admin-dark text-base px-4 py-2 rounded-lg cursor-pointer"
      onClick={() => fnClose({ bool })}
    >
      + {label}
    </button>
  );
}

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "N/A";
  }
};

// Format date range function
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === "N/A" || end === "N/A") return "N/A";

  return `${start} - ${end}`;
};
