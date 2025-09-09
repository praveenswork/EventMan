// src/pages/EventRegister.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

function EventRegister() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [event, setEvent] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid; // Use authenticated user ID

  useEffect(() => {
    const fetchEvent = async () => {
      if (!token) {
        setMessage("Invalid or missing token.");
        setLoading(false);
        return;
      }

      try {
        const inviteRef = doc(db, "invitations", token);
        const inviteSnap = await getDoc(inviteRef);
        console.log(
          "Invitation data:",
          inviteSnap.exists() ? inviteSnap.data() : "Not found"
        );
        if (!inviteSnap.exists()) {
          setMessage("Invalid invitation token.");
          setLoading(false);
          return;
        }

        const inviteData = inviteSnap.data();
        const eventRef = doc(db, "events", inviteData.eventId);
        const eventSnap = await getDoc(eventRef);
        console.log(
          "Event data:",
          eventSnap.exists() ? eventSnap.data() : "Not found"
        );
        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        } else {
          setMessage("Event not found for event ID: " + inviteData.eventId);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setMessage(`Error fetching event: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !name || !email || !phone || !event?.id || !userId) {
      setMessage("Missing required data. Please try again.");
      console.log("Form data:", {
        token,
        name,
        email,
        phone,
        eventId: event?.id,
        userId,
      });
      return;
    }

    try {
      const ticketId = uuidv4();
      const registrationData = {
        eventId: event.id,
        userId, // Use authenticated user ID for registrant
        name,
        email,
        phone,
        token,
        ticketId,
        createdAt: new Date().toISOString(),
      };
      console.log("Submitting registration:", registrationData);
      await setDoc(
        doc(collection(db, "registrations"), ticketId),
        registrationData
      );
      setTicketId(ticketId);
      setMessage("Registration successful! Your Ticket ID is below.");
      setName("");
      setEmail("");
      setPhone("");
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(`Failed to register: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Register for {event?.name || "Event"}
        </h2>
        {message && (
          <p
            className={`mb-4 ${
              message.includes("successful") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        {ticketId ? (
          <div className="text-center">
            <p className="text-lg font-semibold">Your Ticket ID:</p>
            <p className="text-2xl font-bold text-indigo-600">{ticketId}</p>
            <p className="mt-2 text-gray-600">
              Please save this ID for event check-in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border rounded-md dark:bg-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EventRegister;
