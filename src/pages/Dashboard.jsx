import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-6 mt-16">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
