// src/pages/Registrations.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Registrations() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all", "registrations", "attendees"

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setEvents([]);
        setRegistrations([]);
        setError("Please log in to view registrations.");
        return;
      }

      const userId = user.uid;

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
          setError("");
        },
        (err) => {
          console.error("Error fetching events:", err);
          setError("Failed to fetch events: " + err.message);
        }
      );

      const regsQuery = query(
        collection(db, "registrations"),
        where("userId", "==", userId)
      );
      const attendeesQuery = query(
        collection(db, "attendees"),
        where("userId", "==", userId)
      );

      const unsubscribeRegs = onSnapshot(regsQuery, (snapshot) => {
        const regsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          source: "registrations",
        }));
        updateRegistrations(regsList);
      });

      const unsubscribeAttendees = onSnapshot(attendeesQuery, (snapshot) => {
        const attendeesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          source: "attendees",
        }));
        updateRegistrations(attendeesList);
      });

      return () => {
        unsubscribeEvents();
        unsubscribeRegs();
        unsubscribeAttendees();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  const updateRegistrations = (newData) => {
    setRegistrations((prev) => {
      const allData = [...prev, ...newData];
      const uniqueData = Array.from(
        new Set(allData.map((item) => item.email))
      ).map((email) => {
        return allData.find((item) => item.email === email);
      });
      return uniqueData;
    });
  };

  const filteredRegistrations = selectedEvent
    ? registrations.filter((reg) => reg.eventId === selectedEvent)
    : registrations;

  const filteredByView =
    viewMode === "all"
      ? filteredRegistrations
      : filteredRegistrations.filter((reg) => reg.source === viewMode);

  const registrationCount = (eventId) =>
    registrations.filter((reg) => reg.eventId === eventId).length;

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Registrations</h2>

      {/* View Mode Toggle */}
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">View Mode</h3>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)} // Fixed to setViewMode
          className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
        >
          <option value="all">All</option>
          <option value="registrations">Registrations</option>
          <option value="attendees">Attendees</option>
        </select>
      </div>

      {/* Event Selection */}
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Select Event</h3>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} ({registrationCount(event.id)} registered)
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredByView.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            No {viewMode === "all" ? "registrations or attendees" : viewMode}{" "}
            found.
          </p>
        ) : (
          filteredByView.map((reg) => (
            <div
              key={reg.id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md"
            >
              <h3 className="text-lg font-semibold">{reg.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Email: {reg.email}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Phone: {reg.phone || "Not provided" || "N/A"}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Event:{" "}
                {events.find((e) => e.id === reg.eventId)?.name || "Unknown"}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Ticket ID:{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {reg.ticketId || "N/A"}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Type:{" "}
                {reg.source === "registrations" ? "Registration" : "Attendee"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Registrations;
