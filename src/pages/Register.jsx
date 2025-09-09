// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid or missing invitation token.");
        setLoading(false);
        return;
      }
      try {
        const inviteRef = doc(db, "invitations", token);
        const inviteSnap = await getDoc(inviteRef);
        if (!inviteSnap.exists()) {
          setError("Invalid invitation token.");
          setLoading(false);
          return;
        }
        const inviteData = inviteSnap.exists() ? inviteSnap.data() : null;
        if (!inviteData) {
          setError("Invalid invitation data.");
          setLoading(false);
          return;
        }
        const eventRef = doc(db, "events", inviteData.eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
          setEmail(inviteData.email || ""); // Use email from invitation if available
        } else {
          setError("Event not found for event ID: " + inviteData.eventId);
        }
      } catch (err) {
        setError("Failed to verify token: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!event || !auth.currentUser) return;

    try {
      const userId = auth.currentUser.uid; // Ensure authenticated user
      const ticketId = crypto.randomUUID(); // Use crypto for unique ID
      await addDoc(collection(db, "registrations"), {
        name,
        email,
        eventId: event.id,
        userId, // Associate with the authenticated user or event creator
        ticketId,
        createdAt: new Date().toISOString(),
        attended: false,
      });
      navigate("/register-success");
    } catch (err) {
      setError("Failed to register: " + err.message);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Register for Event</h1>
          {event && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              You’ve been invited to {event.name}!
            </p>
          )}
        </div>
        {error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200 dark:bg-gray-600 dark:text-white"
              />
            </div>
            {event && (
              <div className="text-gray-600 dark:text-gray-300">
                <p>Event: {event.name}</p>
                <p>Date: {event.date}</p>
                <p>Location: {event.location}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
