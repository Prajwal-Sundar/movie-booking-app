import React from "react";
import { Link } from "react-router-dom";

const Error404: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem-3rem)] p-6 text-center">
      {/* min-h-[calc(100vh-4rem-3rem)] ensures full height minus header/footer */}
      <h1 className="text-6xl font-extrabold mb-4 text-red-500">404</h1>
      <p className="text-xl mb-6 text-gray-700">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 bg-red-500 rounded hover:bg-red-600 transition font-semibold text-white"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default Error404;
