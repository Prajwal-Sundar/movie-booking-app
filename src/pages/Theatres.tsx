import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";

interface Screen {
  screenNumber: number;
  rows: number;
  cols: number;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Theatre {
  _id: string;
  name: string;
  location: string;
  numberOfScreens: number;
  screens: Screen[];
  owner: Owner;
}

const Theatres: React.FC = () => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    numberOfScreens: 1,
    ownerId: "",
    screens: [{ screenNumber: 1, rows: 10, cols: 10 }],
  });

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const response = await apiCaller<Theatre[]>(ApiEndpoint.GET_THEATRES);
      if (response.success && response.data) setTheatres(response.data);
    } catch (err) {
      console.error("❌ Error fetching theatres:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await apiCaller<Owner[]>(ApiEndpoint.GET_THEATRE_OWNERS);
      if (response.success && response.data) setOwners(response.data);
    } catch (err) {
      console.error("❌ Error fetching owners:", err);
    }
  };

  useEffect(() => {
    fetchTheatres();
    fetchOwners();
  }, []);

  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiCaller(ApiEndpoint.ADD_THEATRE, {
        name: form.name.trim(),
        location: form.location.trim(),
        numberOfScreens: form.numberOfScreens,
        screens: form.screens,
        ownerId: form.ownerId,
      });

      if (response.success) {
        setPopup({
          show: true,
          type: "success",
          title: "Theatre Added",
          message: "Theatre added successfully!",
        });
        setShowAddModal(false);
        fetchTheatres(); // refresh list
      } else {
        setPopup({
          show: true,
          type: "error",
          title: "Add Failed",
          message: response.message || "Unable to add theatre.",
        });
      }
    } catch (err) {
      console.error("❌ Error adding theatre:", err);
      setPopup({
        show: true,
        type: "error",
        title: "Error",
        message: "Network or server error.",
      });
    }
  };

  const handleNumberOfScreensChange = (count: number) => {
    const newScreens = Array.from({ length: count }, (_, i) => ({
      screenNumber: i + 1,
      rows: form.screens[i]?.rows || 10,
      cols: form.screens[i]?.cols || 10,
    }));
    setForm({ ...form, numberOfScreens: count, screens: newScreens });
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Theatres
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
            >
              + Add Theatre
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 text-lg">Loading...</p>
          ) : theatres.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No theatres found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl shadow-md">
                <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Owner</th>
                    <th className="py-3 px-4 text-center">Number of Screens</th>
                    <th className="py-3 px-4 text-center">Screens</th>
                  </tr>
                </thead>
                <tbody>
                  {theatres.map((theatre) => (
                    <tr
                      key={theatre._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-700">
                        {theatre.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {theatre.location}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {theatre.owner?.name}
                        <div className="text-sm text-gray-400">
                          {theatre.owner?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {theatre.numberOfScreens}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTheatre(theatre)}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105"
                        >
                          View Screens
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* ✅ Add Theatre Modal */}
      {showAddModal && (
        <PopupModal
          show={true}
          title="Add New Theatre"
          message=""
          type="info"
          onClose={() => setShowAddModal(false)}
        >
          <form className="mt-4 space-y-4" onSubmit={handleAddTheatre}>
            <input
              type="text"
              placeholder="Theatre Name"
              className="w-full p-3 border rounded-xl"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full p-3 border rounded-xl"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <select
              className="w-full p-3 border rounded-xl"
              value={form.ownerId}
              onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              required
            >
              <option value="">Select Owner</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
            <div>
              <label className="block font-semibold mb-2">
                Number of Screens
              </label>
              <input
                type="number"
                min={1}
                value={form.numberOfScreens}
                onChange={(e) =>
                  handleNumberOfScreensChange(Number(e.target.value))
                }
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>

            <div className="max-h-48 overflow-y-auto border p-3 rounded-xl">
              {form.screens.map((screen, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center mb-3 bg-gray-50 p-3 rounded-lg"
                >
                  <span className="font-semibold">
                    Screen {screen.screenNumber}
                  </span>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min={1}
                      value={screen.rows}
                      onChange={(e) => {
                        const updated = [...form.screens];
                        updated[idx].rows = Number(e.target.value);
                        setForm({ ...form, screens: updated });
                      }}
                      className="w-20 p-2 border rounded-lg"
                      placeholder="Rows"
                    />
                    <input
                      type="number"
                      min={1}
                      value={screen.cols}
                      onChange={(e) => {
                        const updated = [...form.screens];
                        updated[idx].cols = Number(e.target.value);
                        setForm({ ...form, screens: updated });
                      }}
                      className="w-20 p-2 border rounded-lg"
                      placeholder="Cols"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition"
            >
              Add Theatre
            </button>
          </form>
        </PopupModal>
      )}

      {/* ✅ Screens Popup */}
      {selectedTheatre && (
        <PopupModal
          show={true}
          title={`${selectedTheatre.name} - Screens`}
          message=""
          type="info"
          onClose={() => setSelectedTheatre(null)}
        >
          <div className="max-h-60 overflow-y-auto mt-4">
            {selectedTheatre.screens.map((screen, idx) => (
              <div
                key={idx}
                className="flex justify-between bg-gray-100 p-3 rounded-lg mb-2 text-gray-700"
              >
                <span className="font-semibold">
                  Screen {screen.screenNumber}
                </span>
                <span>
                  Rows: <b>{screen.rows}</b> | Cols: <b>{screen.cols}</b>
                </span>
              </div>
            ))}
          </div>
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

export default Theatres;
