// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? user.uid : "null");
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setNotifications([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log("No userId, skipping notification fetch");
      return;
    }

    console.log("Fetching notifications for userId:", userId);
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Notifications fetched:", notificationsList);
        setNotifications(notificationsList);
      },
      (error) => {
        console.error("Error fetching notifications:", error.message);
        console.log("Query:", notificationsQuery);
        console.log(
          "Auth state:",
          auth.currentUser ? auth.currentUser.uid : "null"
        );
        setNotifications([]); // Fallback to empty on error
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addNotification = async (message, type = "info") => {
    if (!userId) {
      console.warn("Cannot add notification: No authenticated user.");
      return;
    }

    const currentUserId = auth.currentUser?.uid; // Double-check userId
    if (currentUserId !== userId) {
      console.warn(
        "UserId mismatch during add: State",
        userId,
        "vs Current",
        currentUserId
      );
      setUserId(currentUserId); // Sync if mismatched
    }

    console.log("Adding notification for userId:", userId, "Message:", message);
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        userId: currentUserId || userId, // Use current auth userId
        message,
        type,
        createdAt: new Date().toISOString(),
        isTemporary: true,
      });
      console.log("Notification added with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding notification:", error.message);
      console.log(
        "Auth state on error:",
        auth.currentUser ? auth.currentUser.uid : "null"
      );
    }
  };

  const removeNotification = async (id) => {
    if (!userId) {
      console.warn("Cannot remove notification: No authenticated user.");
      return;
    }

    console.log(
      "Attempting to remove notification with ID:",
      id,
      "for userId:",
      userId
    );
    try {
      const notificationRef = doc(db, "notifications", id);
      const docSnap = await getDoc(notificationRef); // Verify document exists
      if (!docSnap.exists()) {
        console.warn("Notification document not found with ID:", id);
        return;
      }
      const docData = docSnap.data();
      console.log(
        "Document userId:",
        docData.userId,
        "Authenticated userId:",
        userId
      ); // Debug mismatch
      if (docData.userId !== userId) {
        console.warn(
          "UserId mismatch: Authenticated",
          userId,
          "vs Document",
          docData.userId
        );
        return;
      }

      await deleteDoc(notificationRef);
      console.log("Notification deletion successful for ID:", id);
      // Update local state immediately
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error removing notification:", error.message);
      console.log(
        "Auth state on error:",
        auth.currentUser ? auth.currentUser.uid : "null"
      );
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
