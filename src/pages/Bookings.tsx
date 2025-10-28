import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import { useAuth } from "../components/AuthContext";
import PopupModal from "../components/PopupModal";
import { Film, Clock } from "lucide-react";

interface Booking {
  _id: string;
  show: {
    movieName: string;
    date: string;
    time: string;
  };
  isCancelled?: boolean; // 🆕 added field
}

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshFromStorage } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const fetchBookings = async () => {
    refreshFromStorage();
    if (!user || !user.id) {
      setPopup({
        show: true,
        type: "error",
        title: "Not Logged In",
        message: "Please log in to view bookings.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiCaller<any>(ApiEndpoint.GET_USER_BOOKINGS, {
        userId: user.id,
      });

      console.log("✅ Raw backend response:", response);

      let data: Booking[] = [];

      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        const numericKeys = Object.keys(response).filter(
          (k) => !isNaN(Number(k))
        );
        if (numericKeys.length > 0) {
          data = numericKeys.map((k) => response[k]);
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data?.data)) {
          data = response.data.data;
        }
      } else if (Array.isArray(response)) {
        data = response;
      }

      console.log("✅ Parsed bookings:", data);
      setBookings(data);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setPopup({
        show: true,
        type: "error",
        title: "Network Error",
        message: "Unable to fetch bookings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (dateIso?: string, timeStr?: string) => {
    if (!dateIso) return "";
    try {
      const dt = new Date(dateIso);
      const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
      dt.setHours(hh, mm, 0, 0);
      return dt.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateIso;
    }
  };

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
          🎬 My Bookings
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">
            Loading your bookings...
          </p>
        ) : bookings.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
            {bookings.map((booking) => (
              <motion.div
                key={booking._id}
                onClick={() => navigate(`/booking/${booking._id}`)}
                whileHover={{ scale: 1.05 }}
                className={`relative cursor-pointer bg-white shadow-lg rounded-xl p-5 w-64 border border-gray-100 hover:shadow-2xl transition-all ${
                  booking.isCancelled ? "opacity-70" : ""
                }`} // 🆕 slight fade if cancelled
              >
                {/* 🆕 Cancelled tag */}
                {booking.isCancelled && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                    Cancelled
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <Film className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {booking.show.movieName}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="w-5 h-5 text-pink-500" />
                  <span className="text-sm">
                    {formatDateTime(booking.show.date, booking.show.time)}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mt-1 break-all">
                  ID: {booking._id}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No bookings found.</p>
        )}
      </motion.div>

      <PopupModal
        show={popup.show}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
    </>
  );
};

export default Bookings;
