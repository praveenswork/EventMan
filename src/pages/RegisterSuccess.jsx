// src/pages/RegisterSuccess.jsx
import { Link } from "react-router-dom";

function RegisterSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold">Registration Successful!</h1>
        <p className="text-gray-600 dark:text-gray-300">
          You’ve successfully registered for the event. We look forward to
          seeing you!
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default RegisterSuccess;
