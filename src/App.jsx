// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Attendees from "./pages/Attendees";
import Reports from "./pages/Reports";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import EventRegister from "./pages/EventRegister";
import Registrations from "./pages/Registrations";
import ProtectedRoute from "./components/ProtectedRoute";
import { NotificationProvider } from "./context/NotificationContext";

const Settings = () => <div className="text-2xl">Settings Page</div>;

function DashboardHome() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const eventsQuery = query(
      collection(db, "events"),
      where("userId", "==", userId)
    );
    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching events:", err);
      }
    );

    const attendeesQuery = query(
      collection(db, "attendees"),
      where("userId", "==", userId)
    );
    const unsubscribeAttendees = onSnapshot(
      attendeesQuery,
      (snapshot) => {
        const attendeesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendees(attendeesList);
      },
      (err) => {
        console.error("Error fetching attendees:", err);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeAttendees();
    };
  }, []);

  const totalEvents = events.length;
  const totalAttendees = attendees.filter((a) => a.attended).length;
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  }).length;

  const recentActivity = [
    ...events.map((event) => ({
      type: "event",
      message: `Event "${event.name}" added`,
      timestamp: event.createdAt || event.date,
    })),
    ...attendees.map((attendee) => ({
      type: "attendee",
      message: `Attendee "${attendee.name}" added to "${
        events.find((e) => e.id === attendee.eventId)?.name
      }"`,
      timestamp: attendee.createdAt || new Date().toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  if (loading) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview (Real-Time)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Total Events</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalEvents}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Total Checked-In Attendees</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalAttendees}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {upcomingEvents}
          </p>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <ul className="mt-2 space-y-2">
          {recentActivity.map((activity, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-300">
              {activity.message} -{" "}
              {new Date(activity.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/event-register" element={<EventRegister />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<Events />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="registrations" element={<Registrations />} />
          </Route>
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;
