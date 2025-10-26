import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../components/AuthContext";
import QRCode from "react-qr-code";
import { Film, Calendar, ScreenShare, User, Armchair } from "lucide-react";

interface BookingData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  show: {
    _id: string;
    movieName: string;
    date: string;
    time: string;
    screenNumber: number;
    theatre?: string;
  };
  seats: string[];
}

const Booking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, refreshFromStorage } = useAuth();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const fetchBooking = async () => {
    if (!bookingId) return;
    refreshFromStorage();

    if (!user || !user.id) {
      setPopup({
        show: true,
        type: "error",
        title: "Not Logged In",
        message: "Please log in to view booking details.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiCaller<any>(ApiEndpoint.GET_BOOKING, {
        bookingId,
        userId: user.id,
      });

      const booking = response?.data?.data || response?.data || response;

      if (booking && booking.success && booking.data) {
        setBookingData(booking.data);
      } else if (booking && booking._id) {
        setBookingData(booking);
      } else {
        setPopup({
          show: true,
          type: "error",
          title: "Booking Not Found",
          message: "Booking details could not be found.",
        });
      }
    } catch (err: any) {
      console.error("❌ Error fetching booking:", err);

      // 🚨 If backend returns 403, redirect to /403
      if (err?.response?.status === 403) {
        navigate("/403");
        return;
      }

      setPopup({
        show: true,
        type: "error",
        title: "Network Error",
        message: "Unable to fetch booking details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const formatDateTime = (dateIso?: string, timeStr?: string) => {
    if (!dateIso) return "";
    try {
      const dt = new Date(dateIso);
      const [hh, mm] = (timeStr || "00:00")
        .split(":")
        .map((n) => parseInt(n, 10));
      dt.setHours(hh, mm, 0, 0);
      return dt.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateIso;
    }
  };

  // QR data - compact and readable
  const qrData =
    bookingData &&
    `🎬 ${bookingData.show.movieName}\n🕒 ${formatDateTime(
      bookingData.show.date,
      bookingData.show.time
    )}\n🎭 Screen ${bookingData.show.screenNumber}\n💺 ${bookingData.seats.join(
      ", "
    )}\n👤 ${bookingData.user.name}`;

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-100">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            🎟️ Your Movie Ticket
          </h1>

          {loading ? (
            <p className="text-center text-gray-500 text-lg">
              Loading booking details...
            </p>
          ) : bookingData ? (
            <div className="flex flex-col items-center space-y-6">
              {/* Movie Info */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                  <Film className="w-6 h-6 text-purple-500" />
                  {bookingData.show.movieName}
                </h2>
                <p className="text-gray-500 mt-1">
                  {formatDateTime(bookingData.show.date, bookingData.show.time)}
                </p>
              </div>

              {/* Ticket details */}
              <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-red-100 rounded-xl p-5 w-full text-gray-700 shadow-inner space-y-3">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <ScreenShare className="w-5 h-5 text-purple-600" /> Screen
                  </span>
                  <span>{bookingData.show.screenNumber}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <Armchair className="w-5 h-5 text-pink-600" /> Seats
                  </span>
                  <span className="font-semibold">
                    {bookingData.seats.join(", ")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <User className="w-5 h-5 text-red-600" /> Name
                  </span>
                  <span>{bookingData.user.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <Calendar className="w-5 h-5 text-purple-600" /> Email
                  </span>
                  <span>{bookingData.user.email}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-4 rounded-xl shadow-md text-center">
                <QRCode
                  value={qrData || "No booking info"}
                  size={160}
                  style={{ height: "auto", maxWidth: "100%", width: "160px" }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Scan for ticket details
                </p>
              </div>

              <div className="w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full" />
              <p className="text-center text-gray-400 text-sm italic">
                Enjoy your movie 🎬
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              Booking details not found.
            </p>
          )}
        </div>
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

export default Booking;
