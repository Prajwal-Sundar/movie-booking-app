import React, { useEffect, useRef, useState } from "react";
import { FaStar, FaFilm, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  const [visibleCards, setVisibleCards] = useState([false, false, false]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    const cards = document.querySelectorAll(".role-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto text-center bg-gray-50">
      {/* Hero Section */}
      <section className="mt-12 sm:mt-16 mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 leading-tight">
          Welcome to Movie Booking App!
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 max-w-3xl mx-auto px-2 sm:px-4">
          Discover, manage, and book your favorite movies all in one place.
          Whether you are a theatre owner adding shows or a user booking seats,
          MovieBookingApp makes it seamless.
        </p>
        <button
          onClick={handleScrollToFeatures}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold px-5 py-3 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:scale-105 transform transition"
        >
          Explore Features
        </button>
      </section>

      {/* Roles & Features */}
      <section ref={featuresRef} className="mb-12 sm:mb-16 w-full text-left">
        <h2 className="text-3xl sm:text-4xl font-semibold text-teal-600 mb-8 sm:mb-10 text-center">
          Who Can Use Movie Booking App?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* App Owner */}
          <div
            className={`role-card bg-white shadow-2xl rounded-xl p-5 sm:p-6 border-l-8 border-red-500 transform transition duration-700 ${
              visibleCards[0]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            data-index={0}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-5 flex items-center justify-center">
              <FaStar className="mr-2" /> App Owner
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-center space-x-3 text-gray-700">
                <FaStar className="text-red-500 text-lg sm:text-xl" />
                <span>Add new theatres with details.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaStar className="text-red-500 text-lg sm:text-xl" />
                <span>Define number of screens.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaStar className="text-red-500 text-lg sm:text-xl" />
                <span>Configure screen structure.</span>
              </li>
            </ul>
          </div>

          {/* Theatre Owner */}
          <div
            className={`role-card bg-white shadow-2xl rounded-xl p-5 sm:p-6 border-l-8 border-purple-500 transform transition duration-700 ${
              visibleCards[1]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            data-index={1}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-purple-500 mb-5 flex items-center justify-center">
              <FaFilm className="mr-2" /> Theatre Owner
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-center space-x-3 text-gray-700">
                <FaFilm className="text-purple-500 text-lg sm:text-xl" />
                <span>Add new shows.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaFilm className="text-purple-500 text-lg sm:text-xl" />
                <span>Set movie name, date, and time.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaFilm className="text-purple-500 text-lg sm:text-xl" />
                <span>Assign shows to screens.</span>
              </li>
            </ul>
          </div>

          {/* User */}
          <div
            className={`role-card bg-white shadow-2xl rounded-xl p-5 sm:p-6 border-l-8 border-teal-500 transform transition duration-700 ${
              visibleCards[2]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            data-index={2}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-teal-500 mb-5 flex items-center justify-center">
              <FaTicketAlt className="mr-2" /> User
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-center space-x-3 text-gray-700">
                <FaTicketAlt className="text-teal-500 text-lg sm:text-xl" />
                <span>Browse movies and shows.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaTicketAlt className="text-teal-500 text-lg sm:text-xl" />
                <span>Select preferred seats.</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-700">
                <FaTicketAlt className="text-teal-500 text-lg sm:text-xl" />
                <span>Instant booking confirmation.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-12 sm:mb-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
          Get Started Today!
        </h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-base sm:text-lg px-2">
          Whether you are managing theatres or booking seats, MovieBookingApp
          makes it seamless. Join now and experience the easiest movie booking
          platform!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Link
            to="/login"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transform transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transform transition"
          >
            Register
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
