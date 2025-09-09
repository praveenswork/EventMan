// src/pages/Attendees.jsx
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useNotification } from "../context/NotificationContext";
import { v4 as uuidv4 } from "uuid";

function Attendees() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",
    attended: false,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAttendeeId, setEditAttendeeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addNotification } = useNotification();

  const checkedInAttendees = attendees.filter((a) => a.attended).length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAttendee((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      addNotification("User not authenticated.");
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
      },
      (error) => {
        console.error("Error fetching events:", error);
        addNotification("Failed to fetch events: " + error.message);
      }
    );

    const attendeesQuery = query(
      collection(db, "attendees"),
      where("userId", "==", userId)
    );
    const unsubscribeAttendees = onSnapshot(
      attendeesQuery,
      (snapshot) => {
        const attendeesList = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (attendee) => !selectedEvent || attendee.eventId === selectedEvent
          );
        setAttendees(attendeesList);
      },
      (error) => {
        console.error("Error fetching attendees:", error);
        addNotification("Failed to fetch attendees: " + error.message);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeAttendees();
    };
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      addNotification("Please select an event before adding an attendee.");
      return;
    }
    const userId = auth.currentUser?.uid;
    if (!userId) {
      addNotification("User not authenticated.");
      return;
    }
    const attendeeData = {
      ...newAttendee,
      eventId: selectedEvent,
      userId,
      createdAt: new Date().toISOString(),
    };
    try {
      if (isEditing) {
        const attendeeRef = doc(db, "attendees", editAttendeeId);
        await updateDoc(attendeeRef, attendeeData);
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === editAttendeeId ? { ...a, ...attendeeData } : a
          )
        );
        addNotification(`Attendee "${newAttendee.name}" updated successfully!`);
        setIsEditing(false);
        setEditAttendeeId(null);
      } else {
        const tempId = uuidv4();
        const optimisticAttendee = { ...attendeeData, id: tempId };
        setAttendees((prev) => [...prev, optimisticAttendee]);
        const docRef = await addDoc(collection(db, "attendees"), attendeeData);
        setAttendees((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: docRef.id } : a))
        );
        addNotification(`Attendee "${newAttendee.name}" added successfully!`);
      }
      setNewAttendee({ name: "", email: "", attended: false });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding/updating attendee:", error);
      addNotification("Failed to add/update attendee: " + error.message);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      addNotification("User not authenticated.");
      return;
    }
    const token = uuidv4();
    const inviteData = {
      email: inviteEmail,
      eventId: selectedEvent,
      token,
      userId,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "invitations"), inviteData);
      const event = events.find((e) => e.id === selectedEvent);
      const inviteLink = `${window.location.origin}/event-register?token=${token}`;
      await fetch("http://localhost:3000/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          eventId: selectedEvent,
          token,
        }),
      });
      addNotification(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error("Error sending invite:", error);
      addNotification("Failed to send invitation: " + error.message);
    }
  };

  const handleEdit = (attendee) => {
    setIsEditing(true);
    setEditAttendeeId(attendee.id);
    setNewAttendee(attendee);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const attendeeToDelete = attendees.find((attendee) => attendee.id === id);
      await deleteDoc(doc(db, "attendees", id));
      setAttendees((prev) => prev.filter((a) => a.id !== id));
      addNotification(
        `Attendee "${attendeeToDelete.name}" deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting attendee:", error);
      addNotification("Failed to delete attendee: " + error.message);
    }
  };

  const handleCheckIn = async (attendee) => {
    try {
      const updatedAttendee = { ...attendee, attended: !attendee.attended };
      setAttendees((prev) =>
        prev.map((a) => (a.id === attendee.id ? updatedAttendee : a))
      );
      const attendeeRef = doc(db, "attendees", attendee.id);
      await updateDoc(attendeeRef, { attended: updatedAttendee.attended });
      addNotification(
        `Attendee "${attendee.name}" marked as ${
          updatedAttendee.attended ? "attended" : "not attended"
        }!`
      );
    } catch (error) {
      console.error("Error updating check-in status:", error);
      addNotification("Failed to update check-in status: " + error.message);
    }
  };

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendees (Real-Time)</h2>
        {selectedEvent && (
          <div className="space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
            >
              + Add Attendee
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700"
            >
              ✉️ Invite Attendee
            </button>
          </div>
        )}
      </div>
      {selectedEvent && (
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Checked-In Attendees</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {checkedInAttendees}
          </p>
        </div>
      )}

      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">Select Event</h3>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
        >
          <option value="">Select an Event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="Search attendees by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-600 dark:text-white"
          />
        </div>
      )}

      {selectedEvent && (
        <div className="grid gap-4">
          {filteredAttendees.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No attendees found for this event.
            </p>
          ) : (
            filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{attendee.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {attendee.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Status: {attendee.attended ? "Attended" : "Not Attended"}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleCheckIn(attendee)}
                    className={`px-3 py-1 text-white rounded-md ${
                      attendee.attended
                        ? "bg-gray-600 hover:bg-gray-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {attendee.attended ? "Undo Check-In" : "Check-In"}
                  </button>
                  <button
                    onClick={() => handleEdit(attendee)}
                    className="px-3 py-1 text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attendee.id)}
                    className="px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Attendee" : "Add Attendee"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAttendee.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAttendee.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="attended"
                    checked={newAttendee.attended}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attended
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Invite Attendee</h3>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendees;
