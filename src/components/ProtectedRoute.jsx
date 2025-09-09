// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        // Store the current location to redirect back after login
        const from = location.pathname + location.search;
        navigate("/", { state: { from } });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
