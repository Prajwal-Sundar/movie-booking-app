import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";
import { useAuth } from "../components/AuthContext";

interface Screen {
  screenNumber: number;
  rows: number;
  cols: number;
}

interface Theatre {
  _id: string;
  name: string;
  location: string;
  numberOfScreens: number;
  screens: Screen[];
}

interface Show {
  _id?: string;
  theatre: string;
  movieName: string;
  date: string;
  time: string;
  screenNumber: number;
}

const Shows: React.FC = () => {
  const { user } = useAuth();
  const ownerId = (user as any)?._id || (user as any)?.id;

  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Record<string, Show[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadingShows, setLoadingShows] = useState<Record<string, boolean>>({});
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Show>({
    theatre: "",
    movieName: "",
    date: "",
    time: "",
    screenNumber: 1,
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchTheatres = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const response = await apiCaller<Theatre[]>(ApiEndpoint.GET_THEATRES);
      if (response.success && response.data) {
        const owned = response.data.filter(
          (t) =>
            (t as any).owner?._id === ownerId || (t as any).ownerId === ownerId
        );
        setTheatres(owned);
        owned.forEach((t) => fetchShows(t._id));
      }
    } catch (err) {
      console.error("❌ Error fetching theatres:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async (theatreId: string) => {
    setLoadingShows((prev) => ({ ...prev, [theatreId]: true }));
    try {
      const response = await apiCaller<Show[]>(ApiEndpoint.GET_SHOWS, {
        theatreId,
      });
      if (response.success && response.data) {
        setShows(
          (prev): Record<string, Show[]> => ({
            ...prev,
            [theatreId]: response.data ?? [],
          })
        );
      } else {
        setShows((prev) => ({ ...prev, [theatreId]: [] }));
      }
    } catch (err) {
      console.error(`❌ Error fetching shows for theatre ${theatreId}:`, err);
    } finally {
      setLoadingShows((prev) => ({ ...prev, [theatreId]: false }));
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCaller(ApiEndpoint.ADD_SHOW, {
        theatreId: form.theatre,
        ownerId,
        movieName: form.movieName.trim(),
        date: form.date, // ✅ Back to native <input type="date">
        time: form.time,
        screenNumber: form.screenNumber,
      });

      if (response.success) {
        setPopup({
          show: true,
          type: "success",
          title: "Show Added",
          message: "Show added successfully!",
        });
        setShowAddModal(false);
        fetchShows(form.theatre);
      } else {
        setPopup({
          show: true,
          type: "error",
          title: "Add Failed",
          message: response.message || "Unable to add show.",
        });
      }
    } catch (err) {
      console.error("❌ Error adding show:", err);
      setPopup({
        show: true,
        type: "error",
        title: "Error",
        message: "Network or server error.",
      });
    }
  };

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent mb-8">
            🎬 Shows
          </h1>

          {loading ? (
            <p className="text-center text-gray-500 text-lg">
              Loading theatres...
            </p>
          ) : theatres.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No theatres found for your account.
            </p>
          ) : (
            theatres.map((theatre) => (
              <div
                key={theatre._id}
                className="mb-10 border border-gray-200 rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {theatre.name}
                    </h2>
                    <p className="text-gray-500">{theatre.location}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTheatre(theatre);
                      setForm({
                        theatre: theatre._id,
                        movieName: "",
                        date: "",
                        time: "",
                        screenNumber: 1,
                      });
                      setShowAddModal(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
                  >
                    + Add Show
                  </button>
                </div>

                {/* ✅ Loading indicator for shows */}
                {loadingShows[theatre._id] ? (
                  <p className="text-center text-gray-500 py-4 animate-pulse">
                    Loading shows...
                  </p>
                ) : shows[theatre._id] && shows[theatre._id].length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl shadow-sm">
                      <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
                        <tr>
                          <th className="py-3 px-4 text-left">Movie</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Time</th>
                          <th className="py-3 px-4 text-center">Screen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shows[theatre._id].map((show) => (
                          <tr
                            key={show._id}
                            className="border-b hover:bg-gray-50 transition"
                          >
                            <td className="py-3 px-4 font-medium text-gray-700">
                              {show.movieName}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {formatDate(show.date)}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {show.time}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                              {show.screenNumber}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No shows found for this theatre.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ✅ Add Show Modal */}
      {showAddModal && selectedTheatre && (
        <PopupModal
          show={true}
          title={`Add Show - ${selectedTheatre.name}`}
          message=""
          type="info"
          onClose={() => setShowAddModal(false)}
        >
          <form className="mt-4 space-y-4" onSubmit={handleAddShow}>
            <input
              type="text"
              placeholder="Movie Name"
              className="w-full p-3 border rounded-xl"
              value={form.movieName}
              onChange={(e) => setForm({ ...form, movieName: e.target.value })}
              required
            />

            {/* ✅ Reverted to native date picker */}
            <input
              type="date"
              className="w-full p-3 border rounded-xl"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <input
              type="time"
              className="w-full p-3 border rounded-xl"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />

            <select
              className="w-full p-3 border rounded-xl"
              value={form.screenNumber}
              onChange={(e) =>
                setForm({ ...form, screenNumber: Number(e.target.value) })
              }
              required
            >
              <option value="">Select Screen</option>
              {selectedTheatre.screens.map((s) => (
                <option key={s.screenNumber} value={s.screenNumber}>
                  Screen {s.screenNumber}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition"
            >
              Add Show
            </button>
          </form>
        </PopupModal>
      )}

      {/* ✅ Global Popup */}
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

export default Shows;
