// src/components/TopBar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";

function TopBar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { notifications, removeNotification } = useNotification();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [temporaryNotifications, setTemporaryNotifications] = useState([]);
  const [isDismissing, setIsDismissing] = useState(false); // Loading state for dismissal

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      await signOut(auth);
      console.log("Logout successful, navigating to /");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationOpen && !event.target.closest(".notification-bell")) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  // Handle temporary notifications (5-second display)
  useEffect(() => {
    const newTemporary = notifications.filter((n) => n.isTemporary);
    if (newTemporary.length > 0) {
      setTemporaryNotifications((prev) => [...prev, ...newTemporary]);
      const timer = setTimeout(() => {
        setTemporaryNotifications((prev) =>
          prev.filter((n) => !newTemporary.some((nt) => nt.id === n.id))
        );
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const persistentNotifications = notifications.filter((n) => !n.isTemporary);

  const handleDismiss = async (id) => {
    setIsDismissing(true);
    console.log("Dismissing notification with ID:", id);
    await removeNotification(id);
    setIsDismissing(false);
  };

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-700 shadow-md flex items-center justify-between px-4">
      <div className="text-lg font-semibold">Dashboard</div>
      <div className="flex items-center space-x-4">
        <div className="relative notification-bell">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring focus:ring-indigo-200"
          >
            🔔
            {temporaryNotifications.length + persistentNotifications.length >
              0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {temporaryNotifications.length + persistentNotifications.length}
              </span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
              <div className="p-4 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold">Notifications</h4>
                {temporaryNotifications.length +
                  persistentNotifications.length ===
                0 ? (
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    No notifications
                  </p>
                ) : (
                  [...temporaryNotifications, ...persistentNotifications].map(
                    (notif) => (
                      <div
                        key={notif.id}
                        className="p-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center"
                      >
                        <span className="text-sm">{notif.message}</span>
                        <button
                          onClick={() => handleDismiss(notif.id)}
                          disabled={isDismissing}
                          className={`ml-4 text-sm ${
                            isDismissing
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 dark:text-red-400 hover:underline"
                          }`}
                        >
                          {isDismissing ? "Dismissing..." : "Dismiss"}
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>
        <span className="text-gray-600 dark:text-gray-300">
          {auth.currentUser?.displayName || auth.currentUser?.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-200"
        >
          Logout
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring focus:ring-indigo-200"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </div>
  );
}

export default TopBar;
