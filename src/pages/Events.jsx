// src/pages/Events.jsx
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
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useNotification } from "../context/NotificationContext";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";

// Utility to log Firebase state for debugging
const logFirebaseState = () => {
  const user = auth.currentUser;
  console.log("Auth State:", {
    userId: user ? user.uid : null,
    isAuthenticated: !!user,
    token: user ? "Available" : "None",
  });
  console.log("Firestore Instance:", db);
};

function Events() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const { addNotification, notifications, removeNotification } =
    useNotification();

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        addNotification("User not authenticated. Please log in.", "error");
        logFirebaseState();
        return false;
      }
      return true;
    };

    if (!checkAuth()) return;

    const userId = auth.currentUser.uid;
    console.log("Fetching events for userId:", userId);
    const eventsQuery = query(
      collection(db, "events"),
      where("userId", "==", userId)
    );
    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
        console.log("Events fetched:", eventsList.length);
      },
      (error) => {
        console.error("Error fetching events:", error);
        addNotification("Failed to fetch events: " + error.message, "error");
        logFirebaseState();
      }
    );

    return () => unsubscribe();
  }, [addNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      addNotification("User not authenticated. Please log in.", "error");
      logFirebaseState();
      return;
    }

    const userId = user.uid;
    const eventData = {
      ...newEvent,
      userId,
      createdAt: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        const eventRef = doc(db, "events", editEventId);
        await updateDoc(eventRef, eventData);
        addNotification(
          `Event "${newEvent.name}" updated successfully!`,
          "success"
        );
      } else {
        await addDoc(collection(db, "events"), eventData);
        addNotification(
          `Event "${newEvent.name}" added successfully!`,
          "success"
        );
      }
      setNewEvent({ name: "", date: "", time: "", location: "", type: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding/updating event:", error);
      addNotification("Failed to add/update event: " + error.message, "error");
      logFirebaseState();
    }
  };

  const handleEdit = (event) => {
    setIsEditing(true);
    setEditEventId(event.id);
    setNewEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const user = auth.currentUser;
    if (!user) {
      addNotification("User not authenticated. Cannot delete event.", "error");
      logFirebaseState();
      return;
    }

    try {
      await deleteDoc(doc(db, "events", id));
      addNotification("Event deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      addNotification("Failed to delete event: " + error.message, "error");
      logFirebaseState();
    }
  };

  const handleGenerateImage = async (event) => {
    const user = auth.currentUser;
    if (!user) {
      addNotification(
        "User not authenticated. Cannot generate invitation.",
        "error"
      );
      logFirebaseState();
      return;
    }

    let inviteRef = null;
    try {
      const userId = user.uid;
      const safeEvent = {
        name: event.name || "Unnamed Event",
        date: event.date || "Not set",
        time: event.time || "Not set",
        location: event.location || "Not set",
        type: event.type || "Not set",
      };

      const token = uuidv4();
      const inviteData = {
        eventId: event.id,
        token,
        userId,
        createdAt: new Date().toISOString(),
      };
      inviteRef = doc(db, "invitations", token);
      console.log("Writing invitation with data:", inviteData);
      await setDoc(inviteRef, inviteData);
      const inviteSnap = await getDoc(inviteRef);
      if (!inviteSnap.exists())
        throw new Error("Failed to verify invitation creation.");

      const inviteUrl = `${window.location.origin}/event-register?token=${token}`;
      const qrCodeUrl = await QRCode.toDataURL(inviteUrl, {
        width: 150,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });

      const invitationDiv = document.createElement("div");
      invitationDiv.style.position = "absolute";
      invitationDiv.style.left = "-9999px";
      invitationDiv.style.width = "500px";
      invitationDiv.style.height = "350px";
      invitationDiv.style.background =
        "linear-gradient(to bottom right, #7b1fa2, #f06292, #ff9800)";
      invitationDiv.style.borderRadius = "20px";
      invitationDiv.style.padding = "20px";
      invitationDiv.style.boxSizing = "border-box";

      const overlay = document.createElement("div");
      overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      overlay.style.borderRadius = "20px";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.position = "relative";
      invitationDiv.appendChild(overlay);

      const wave = document.createElement("div");
      wave.style.position = "absolute";
      wave.style.top = "40px";
      wave.style.width = "100%";
      wave.style.height = "20px";
      wave.style.background =
        "linear-gradient(to right, transparent, #ffffff 50%, transparent)";
      overlay.appendChild(wave);

      const title = document.createElement("div");
      title.style.textAlign = "center";
      title.style.fontSize = "28px";
      title.style.fontWeight = "bold";
      title.style.color = "#d81b60";
      title.style.marginTop = "10px";
      title.innerText = "You're Invited!";
      overlay.appendChild(title);

      const details = document.createElement("div");
      details.style.marginLeft = "20px";
      details.style.marginTop = "30px";
      details.innerHTML = `
        <p style="font-size: 18px; font-weight: bold; color: #c62828;">Event: ${safeEvent.name}</p>
        <p style="font-size: 16px; color: #1976d2;">Date: ${safeEvent.date}</p>
        <p style="font-size: 16px; color: #388e3c;">Time: ${safeEvent.time}</p>
        <p style="font-size: 16px; color: #f57c00;">Location: ${safeEvent.location}</p>
        <p style="font-size: 16px; color: #512da8;">Type: ${safeEvent.type}</p>
      `;
      overlay.appendChild(details);

      const qrContainer = document.createElement("div");
      qrContainer.style.position = "absolute";
      qrContainer.style.right = "20px";
      qrContainer.style.top = "110px";
      qrContainer.style.width = "160px";
      qrContainer.style.height = "160px";
      qrContainer.style.borderRadius = "50%";
      qrContainer.style.backgroundColor = "#ffffff";
      qrContainer.style.border = "3px solid #f06292";
      qrContainer.style.display = "flex";
      qrContainer.style.alignItems = "center";
      qrContainer.style.justifyContent = "center";
      const qrImage = document.createElement("img");
      qrImage.src = qrCodeUrl;
      qrImage.style.width = "150px";
      qrImage.style.height = "150px";
      qrContainer.appendChild(qrImage);
      overlay.appendChild(qrContainer);

      const star1 = document.createElement("div");
      star1.innerText = "★";
      star1.style.position = "absolute";
      star1.style.left = "40px";
      star1.style.bottom = "100px";
      star1.style.color = "#ffffff";
      star1.style.fontSize = "20px";
      overlay.appendChild(star1);

      const star2 = document.createElement("div");
      star2.innerText = "★";
      star2.style.position = "absolute";
      star2.style.right = "50px";
      star2.style.top = "20px";
      star2.style.color = "#ffffff";
      star2.style.fontSize = "20px";
      overlay.appendChild(star2);

      const footer = document.createElement("div");
      footer.innerText = "Scan to register!";
      footer.style.position = "absolute";
      footer.style.bottom = "20px";
      footer.style.right = "20px";
      footer.style.fontSize = "12px";
      footer.style.fontStyle = "italic";
      footer.style.color = "#333333";
      overlay.appendChild(footer);

      document.body.appendChild(invitationDiv);
      const canvas = await html2canvas(invitationDiv, {
        width: 500,
        height: 350,
        scale: 2,
      });
      const imageUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${safeEvent.name}-invitation.png`;
      link.click();

      document.body.removeChild(invitationDiv);
      addNotification(
        `Creative invitation generated for "${safeEvent.name}"!`,
        "success"
      );
    } catch (error) {
      console.error("Error generating image or invitation:", error);
      addNotification(
        "Failed to generate invitation: " + error.message,
        "error"
      );
      if (inviteRef)
        await deleteDoc(inviteRef).catch((err) =>
          console.error("Cleanup failed:", err)
        );
      logFirebaseState();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events (Real-Time)</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
        >
          + Add Event
        </button>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No events found.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{event.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Date: {event.date || "Not set"} | Time:{" "}
                  {event.time || "Not set"} | Location:{" "}
                  {event.location || "Not set"} | Type:{" "}
                  {event.type || "Not set"}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-1 text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleGenerateImage(event)}
                  className="px-3 py-1 text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Generate
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Event" : "Add Event"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newEvent.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div className="fixed top-4 right-4 space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-blue-500 text-white p-3 rounded-md shadow-md flex justify-between items-center"
                  >
                    <span>{notif.message}</span>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="ml-2 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={newEvent.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
                />
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
    </div>
  );
}

export default Events;
