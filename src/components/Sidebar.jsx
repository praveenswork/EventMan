// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Events", path: "/dashboard/events", icon: "🎉" },
    { name: "Attendees", path: "/dashboard/attendees", icon: "👥" },
    { name: "Registrations", path: "/dashboard/registrations", icon: "📝" }, // New item
    { name: "Reports", path: "/dashboard/reports", icon: "📊" },
    // { name: "Settings", path: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700 dark:border-gray-800">
        Event Management
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block p-2 rounded-md flex items-center space-x-2 ${
                    isActive
                      ? "bg-indigo-600 dark:bg-indigo-700"
                      : "hover:bg-gray-700 dark:hover:bg-gray-800"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
