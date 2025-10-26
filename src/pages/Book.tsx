import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../components/AuthContext";

interface SeatResponse {
  success?: boolean;
  message?: string;
  rows: number;
  columns: number;
  bookedSeats: number[][];
  movieName?: string;
  showTime?: string; // e.g. "18:00"
  showDate?: string; // ISO date string
  theatreName?: string;
  theatreLocation?: string;
  screenNumber?: number;
}

interface BookingResponse {
  success: boolean;
  message?: string;
  bookingId?: string;
}

const Book: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const { user, isAuthenticated, refreshFromStorage } = useAuth();
  const navigate = useNavigate();

  const [seatData, setSeatData] = useState<SeatResponse | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const [confirmPopup, setConfirmPopup] = useState(false);

  // --- Fetch seat & show info (robust to response shapes) ---
  const fetchSeatData = async () => {
    if (!showId) return;
    setLoading(true);
    try {
      const response = await apiCaller<SeatResponse>(
        ApiEndpoint.GET_SHOW_SEATS,
        { showId }
      );
      console.log("🔍 raw GET_SHOW_SEATS response:", response);

      // support both: { success, data: {...} }  and { success, rows, columns, ... }
      const seatInfo = (response as any).data ?? (response as any);
      console.log("🔎 normalized seatInfo:", seatInfo);

      if (
        seatInfo &&
        (seatInfo.rows !== undefined || seatInfo.columns !== undefined)
      ) {
        setSeatData(seatInfo as SeatResponse);
      } else {
        setSeatData(null);
        setPopup({
          show: true,
          type: "error",
          title: "Error",
          message: (response as any).message || "Failed to load seat data.",
        });
      }
    } catch (err) {
      console.error("❌ Error fetching seats:", err);
      setSeatData(null);
      setPopup({
        show: true,
        type: "error",
        title: "Network Error",
        message: "Could not fetch seat information.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  // --- seat selection helpers ---
  const toggleSeat = (row: number, col: number) => {
    const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const isSeatBooked = (row: number, col: number): boolean =>
    !!seatData?.bookedSeats?.some(([r, c]) => r === row && c === col);

  // --- Booking handler (confirm popup stays open until success shown) ---
  const handleBookSeats = async () => {
    if (!showId || selectedSeats.length === 0) return;
    if (!isAuthenticated) {
      setPopup({
        show: true,
        type: "error",
        title: "Not Logged In",
        message: "Please log in before booking seats.",
      });
      return;
    }

    setLoading(true);
    try {
      refreshFromStorage();
      const userId = user?.id;
      if (!userId) {
        setPopup({
          show: true,
          type: "error",
          title: "Booking Failed",
          message: "User ID is missing. Please log in again.",
        });
        return;
      }

      // convert selectedSeats like "A5" → [0,4]
      const seatsPayload = selectedSeats.map((label) => {
        const row = label.charCodeAt(0) - 65;
        const col = parseInt(label.slice(1), 10) - 1;
        return [row, col];
      });

      console.log("📦 booking payload:", {
        userId,
        showId,
        seats: seatsPayload,
      });

      const response = await apiCaller<BookingResponse>(
        ApiEndpoint.BOOK_SEATS,
        {
          userId,
          showId,
          seats: seatsPayload,
        }
      );
      console.log("📩 BOOK_SEATS response:", response);

      const result = (response as any).data ?? response;

      if (result.success) {
        // booking succeeded — show success popup (confirm popup should remain open until success popup appears)
        setBookingId(result.bookingId ?? null);
        setPopup({
          show: true,
          type: "success",
          title: "Booking Successful 🎉",
          message:
            result.message || "Your seats have been booked successfully!",
        });
        // close confirmation modal now that booking succeeded
        setConfirmPopup(false);
        // do NOT immediately refresh seats — wait for user to see success and redirect
      } else {
        setPopup({
          show: true,
          type: "error",
          title: "Booking Failed",
          message: result.message || "Could not complete booking.",
        });
      }
    } catch (err) {
      console.error("❌ Booking Error:", err);
      setPopup({
        show: true,
        type: "error",
        title: "Network Error",
        message: "Unable to complete booking.",
      });
    } finally {
      setLoading(false);
    }
  };

  // countdown and redirect after success popup shown
  useEffect(() => {
    if (popup.type === "success" && popup.show && bookingId) {
      let timeLeft = 3;
      setCountdown(timeLeft);
      const t = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(t);
          setPopup({ ...popup, show: false });
          navigate(`/booking/${bookingId}`);
        }
      }, 1000);
      return () => clearInterval(t);
    }
  }, [popup, bookingId, navigate]);

  // --- Seat Icon component (displays label inside seat) ---
  const SeatIcon: React.FC<{
    booked: boolean;
    selected: boolean;
    label: string;
    onClick?: () => void;
  }> = ({ booked, selected, label, onClick }) => {
    const base =
      "relative w-10 h-10 border-2 rounded-t-lg transition shadow-sm flex items-center justify-center font-semibold text-xs";
    const bookedCls =
      "bg-gray-400 text-white cursor-not-allowed border-gray-400";
    const selectedCls = "bg-red-500 text-white border-red-600";
    const availCls = "bg-green-200 border-green-400 hover:bg-green-300";

    const cls = booked ? bookedCls : selected ? selectedCls : availCls;

    return (
      <motion.button
        whileTap={!booked ? { scale: 0.95 } : undefined}
        disabled={booked}
        onClick={onClick}
        className={`${base} ${cls}`}
        style={{
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
        }}
      >
        {label}
        <div className="absolute bottom-0 left-1 right-1 h-2 bg-current opacity-30 rounded-b-md" />
      </motion.button>
    );
  };

  // --- Render grid ---
  const renderSeatGrid = () => {
    if (!seatData) return <p className="text-gray-500">No seat data found.</p>;
    const rows = Array.from({ length: seatData.rows }, (_, i) => i);
    const cols = Array.from({ length: seatData.columns }, (_, i) => i);

    return (
      <div className="flex flex-col items-center space-y-2 mt-6">
        {rows.map((r) => (
          <div key={r} className="flex space-x-2">
            {cols.map((c) => {
              const seatId = `${String.fromCharCode(65 + r)}${c + 1}`;
              const booked = isSeatBooked(r, c);
              const selected = selectedSeats.includes(seatId);
              return (
                <SeatIcon
                  key={seatId}
                  booked={booked}
                  selected={selected}
                  label={seatId}
                  onClick={() => toggleSeat(r, c)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // --- format date/time for display ---
  const formatDateTime = (dateIso?: string, timeStr?: string) => {
    // If showDate is ISO and showTime is like "18:00" combine them,
    // otherwise gracefully fallback to whichever is available.
    try {
      if (dateIso && timeStr) {
        // combine ISO date and time (if dateIso might be midnight UTC like "2025-10-30T00:00:00.000Z")
        const dt = new Date(dateIso);
        // if showTime provided (e.g. "18:00"), override time in dt
        const [hh, mm] = (timeStr || "00:00")
          .split(":")
          .map((n) => parseInt(n, 10));
        dt.setHours(hh, mm, 0, 0);
        return dt.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (dateIso) {
        const dt = new Date(dateIso);
        return dt.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else if (timeStr) {
        // show only time in user locale (assuming HH:mm)
        const [hh, mm] = (timeStr || "00:00")
          .split(":")
          .map((n) => parseInt(n, 10));
        const now = new Date();
        now.setHours(hh, mm, 0, 0);
        return now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      // fallback
    }
    return (dateIso ? dateIso : "") + (timeStr ? ` ${timeStr}` : "");
  };

  const movieName = seatData?.movieName ?? "Unknown Movie";
  const theatreName = seatData?.theatreName ?? "Unknown Theatre";
  const theatreLocation = seatData?.theatreLocation ?? "Unknown Location";
  const formattedDateTime = formatDateTime(
    seatData?.showDate,
    seatData?.showTime
  );

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-5xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Book Seats
          </h1>

          <div className="text-gray-700 mb-6">
            <p>
              🎬 <b>Movie:</b> {movieName}
            </p>
            <p>
              🎭 <b>Theatre:</b> {theatreName}, {theatreLocation}
            </p>
            <p>
              🕒 <b>Date & Time:</b> {formattedDateTime || "Unknown Date/Time"}
            </p>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg">
              Loading seats...
            </p>
          ) : (
            renderSeatGrid()
          )}

          <div className="flex justify-center mt-4 space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded-t-sm" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-500 border border-red-600 rounded-t-sm" />
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-400 border border-gray-400 rounded-t-sm" />
              <span>Booked</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              disabled={selectedSeats.length === 0}
              onClick={() => setConfirmPopup(true)}
              className={`px-8 py-3 rounded-xl font-semibold text-white shadow-md transition ${
                selectedSeats.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105"
              }`}
            >
              Book {selectedSeats.length || ""}{" "}
              {selectedSeats.length === 1 ? "Seat" : "Seats"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Confirm popup - stays open while booking runs, closed only on success */}
      {confirmPopup && (
        <PopupModal
          show={true}
          title="Confirm Booking"
          message={`You have selected: ${selectedSeats.join(
            ", "
          )}. Proceed to book?`}
          type="info"
          onClose={() => setConfirmPopup(false)}
        >
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setConfirmPopup(false)}
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleBookSeats}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading
                  ? "bg-green-300 cursor-wait"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loading ? "Booking..." : "Confirm"}
            </button>
          </div>
        </PopupModal>
      )}

      {/* Success/Error popup */}
      <PopupModal
        show={popup.show}
        title={popup.title}
        message={
          popup.type === "success" && countdown !== null
            ? `${popup.message} Redirecting in ${countdown}...`
            : popup.message
        }
        type={popup.type}
        onClose={() => {
          if (popup.type === "success" && bookingId) {
            navigate(`/booking/${bookingId}`);
          } else {
            setPopup({ ...popup, show: false });
          }
        }}
      />
    </>
  );
};

export default Book;
