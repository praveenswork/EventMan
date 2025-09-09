// src/pages/Reports.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function Reports() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch real-time events and attendees
  useEffect(() => {
    const eventsCollection = collection(db, "events");
    const unsubscribeEvents = onSnapshot(eventsCollection, (snapshot) => {
      const eventsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);
      setLoading(false);
    });

    const attendeesCollection = collection(db, "attendees");
    const unsubscribeAttendees = onSnapshot(attendeesCollection, (snapshot) => {
      const attendeesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendees(attendeesList);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeAttendees();
    };
  }, []);

  // Filter events by selected type
  const filteredEvents =
    selectedEventType === "all"
      ? events
      : events.filter((event) => event.type === selectedEventType);

  // Calculate metrics
  const totalEvents = filteredEvents.length;
  const totalAttendees = attendees.filter((a) =>
    filteredEvents.some((e) => e.id === a.eventId)
  ).length;
  const checkedInAttendees = attendees.filter(
    (a) => filteredEvents.some((e) => e.id === a.eventId) && a.attended
  ).length;
  const attendanceRate =
    totalAttendees > 0
      ? ((checkedInAttendees / totalAttendees) * 100).toFixed(1)
      : 0;

  // Event type counts for Pie chart
  const eventTypeCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = {
    labels: Object.keys(eventTypeCounts),
    datasets: [
      {
        data: Object.values(eventTypeCounts),
        backgroundColor: ["#4B5EAA", "#6B7280", "#9CA3AF", "#D1D5DB"],
        borderWidth: 1,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 12 }, color: "#4B5563" },
      },
    },
  };

  // Attendance by event for Bar chart
  const barData = {
    labels: filteredEvents.map(
      (e) => e.name.slice(0, 10) + (e.name.length > 10 ? "..." : "")
    ),
    datasets: [
      {
        label: "Checked-In",
        data: filteredEvents.map(
          (e) =>
            attendees.filter((a) => a.eventId === e.id && a.attended).length
        ),
        backgroundColor: "#4B5EAA",
        borderRadius: 4,
      },
      {
        label: "Total",
        data: filteredEvents.map(
          (e) => attendees.filter((a) => a.eventId === e.id).length
        ),
        backgroundColor: "#D1D5DB",
        borderRadius: 4,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { font: { size: 10 }, color: "#4B5563" } },
      y: { beginAtZero: true, ticks: { font: { size: 10 }, color: "#4B5563" } },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 12 }, color: "#4B5563" },
      },
    },
  };

  // Unique event types for dropdown
  const eventTypes = ["all", ...new Set(events.map((e) => e.type))];

  if (loading) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Reports & Analytics
      </h2>

      {/* Event Type Selection */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <label
          htmlFor="eventType"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Filter by Event Type
        </label>
        <select
          id="eventType"
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All Events" : type}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Events
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {totalEvents}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Attendees
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {totalAttendees}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Checked-In Attendees
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {checkedInAttendees}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Attendance Rate
          </h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {attendanceRate}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Event Type Distribution
          </h3>
          <div style={{ height: "200px" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Attendance by Event
          </h3>
          <div style={{ height: "200px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
