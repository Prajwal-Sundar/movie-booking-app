import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiCaller, ApiEndpoint } from "../apiCaller";
import PopupModal from "../components/PopupModal";
import { useNavigate } from "react-router-dom";

interface RawShow {
  _id: string;
  theatre: string;
  movieName: string;
  date: string;
  time: string;
  screenNumber: number;
  __v?: number;
}

interface Theatre {
  _id: string;
  name: string;
  location?: string;
}

type SortKey = "movieName" | "theatre" | "date" | "time" | null;
type SortOrder = "asc" | "desc";

const AllShows: React.FC = () => {
  const [shows, setShows] = useState<RawShow[]>([]);
  const [theatreMap, setTheatreMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    order: SortOrder;
  }>({
    key: null,
    order: "asc",
  });

  const [filters, setFilters] = useState({
    movie: "",
    theatre: "",
    date: "",
    timeStart: "",
    timeEnd: "",
  });

  const navigate = useNavigate();

  const fetchTheatres = async () => {
    try {
      const resp = await apiCaller<Theatre[]>(ApiEndpoint.GET_THEATRES);
      if (resp.success && resp.data) {
        const map: Record<string, string> = {};
        resp.data.forEach((t) => {
          map[t._id] = t.location ? `${t.name}||${t.location}` : t.name;
        });
        setTheatreMap(map);
      }
    } catch (err) {
      console.error("Error fetching theatres:", err);
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      const resp = await apiCaller<RawShow[]>(ApiEndpoint.GET_SHOWS);
      if (resp.success && resp.data) setShows(resp.data);
      else
        setPopup({
          show: true,
          type: "error",
          title: "Fetch Failed",
          message: resp.message || "Unable to fetch shows.",
        });
    } catch (err) {
      console.error("Error fetching shows:", err);
      setPopup({
        show: true,
        type: "error",
        title: "Error",
        message: "Network or server error.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchTheatres();
      await fetchShows();
    })();
  }, []);

  const formatDate = (dateStr: string, timeStr: string) => {
    try {
      const yyyyMmDd = dateStr?.slice(0, 10);
      const normalizedTime =
        timeStr?.length === 5 ? `${timeStr}:00` : timeStr || "00:00:00";
      const iso = `${yyyyMmDd}T${normalizedTime}Z`;
      const dt = new Date(iso);
      if (isNaN(dt.getTime()))
        return { dateLabel: dateStr, timeLabel: timeStr };
      return {
        dateLabel: dt.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        timeLabel: dt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { dateLabel: dateStr, timeLabel: timeStr };
    }
  };

  // Sorting Logic
  const sortData = (data: RawShow[]): RawShow[] => {
    const { key, order } = sortConfig;
    if (!key) return data;
    return [...data].sort((a, b) => {
      let valA: any;
      let valB: any;
      if (key === "movieName") {
        valA = a.movieName.toLowerCase();
        valB = b.movieName.toLowerCase();
      } else if (key === "theatre") {
        valA = (theatreMap[a.theatre] || "").toLowerCase();
        valB = (theatreMap[b.theatre] || "").toLowerCase();
      } else if (key === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (key === "time") {
        const [hA, mA] = a.time.split(":").map(Number);
        const [hB, mB] = b.time.split(":").map(Number);
        valA = hA * 60 + mA;
        valB = hB * 60 + mB;
      }
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        order: sortConfig.order === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, order: "asc" });
    }
  };

  const renderSortArrow = (key: SortKey) => {
    if (sortConfig.key !== key) return <span className="opacity-40">↕️</span>;
    return sortConfig.order === "asc" ? (
      <span className="text-sm ml-1">▲</span>
    ) : (
      <span className="text-sm ml-1">▼</span>
    );
  };

  // Filtering Logic
  const applyFilters = (data: RawShow[]): RawShow[] => {
    return data.filter((show) => {
      const theatreName = theatreMap[show.theatre]?.toLowerCase() || "";
      const movieMatch = show.movieName
        .toLowerCase()
        .includes(filters.movie.toLowerCase());
      const theatreMatch = theatreName.includes(filters.theatre.toLowerCase());

      const showDate = show.date.slice(0, 10);
      const dateMatch = filters.date ? showDate === filters.date : true;

      const [h, m] = show.time.split(":").map(Number);
      const showMinutes = h * 60 + m;
      const startMinutes =
        filters.timeStart && filters.timeStart.includes(":")
          ? (() => {
              const [hs, ms] = filters.timeStart.split(":").map(Number);
              return hs * 60 + ms;
            })()
          : null;
      const endMinutes =
        filters.timeEnd && filters.timeEnd.includes(":")
          ? (() => {
              const [he, me] = filters.timeEnd.split(":").map(Number);
              return he * 60 + me;
            })()
          : null;

      const timeMatch =
        (!startMinutes || showMinutes >= startMinutes) &&
        (!endMinutes || showMinutes <= endMinutes);

      return movieMatch && theatreMatch && dateMatch && timeMatch;
    });
  };

  const sortedShows = sortData(applyFilters(shows));

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-7xl">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              🎬 All Available Shows
            </h1>
            <button
              onClick={async () => {
                await fetchTheatres();
                await fetchShows();
              }}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:scale-105 transition"
            >
              🔄 Refresh
            </button>
          </div>

          {/* 🔍 Enhanced Filters Section */}
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              🔎 Filter Shows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Movie Name
                </label>
                <input
                  type="text"
                  placeholder="Movie"
                  value={filters.movie}
                  onChange={(e) =>
                    setFilters({ ...filters, movie: e.target.value })
                  }
                  className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-pink-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Theatre
                </label>
                <input
                  type="text"
                  placeholder="Theatre"
                  value={filters.theatre}
                  onChange={(e) =>
                    setFilters({ ...filters, theatre: e.target.value })
                  }
                  className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-pink-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                  className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-pink-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Time Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={filters.timeStart}
                    onChange={(e) =>
                      setFilters({ ...filters, timeStart: e.target.value })
                    }
                    className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                  <input
                    type="time"
                    value={filters.timeEnd}
                    onChange={(e) =>
                      setFilters({ ...filters, timeEnd: e.target.value })
                    }
                    className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-pink-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 📋 Shows Table */}
          {loading ? (
            <p className="text-center text-gray-500 text-lg">
              Loading shows...
            </p>
          ) : sortedShows.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">
              No shows match your filters 🎞️
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl shadow-md">
                <thead className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
                  <tr>
                    <th
                      onClick={() => toggleSort("movieName")}
                      className="py-3 px-4 text-left cursor-pointer select-none"
                    >
                      Movie {renderSortArrow("movieName")}
                    </th>
                    <th
                      onClick={() => toggleSort("theatre")}
                      className="py-3 px-4 text-left cursor-pointer select-none"
                    >
                      Theatre {renderSortArrow("theatre")}
                    </th>
                    <th
                      onClick={() => toggleSort("date")}
                      className="py-3 px-4 text-left cursor-pointer select-none"
                    >
                      Date {renderSortArrow("date")}
                    </th>
                    <th
                      onClick={() => toggleSort("time")}
                      className="py-3 px-4 text-left cursor-pointer select-none"
                    >
                      Time {renderSortArrow("time")}
                    </th>
                    <th className="py-3 px-4 text-center">Screen</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShows.map((show) => {
                    const theatreEntry = theatreMap[show.theatre];
                    const { dateLabel, timeLabel } = formatDate(
                      show.date,
                      show.time
                    );

                    let theatreName = "Unknown Theatre";
                    let theatreLocation = "";

                    if (theatreEntry) {
                      const [name, location] = theatreEntry.split("||");
                      theatreName = name;
                      theatreLocation = location || "";
                    }

                    return (
                      <tr
                        key={show._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        {/* 🎬 Movie Name */}
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {show.movieName}
                        </td>

                        {/* 🏛️ Theatre Name + Location */}
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex flex-col">
                            <span className="font-semibold">{theatreName}</span>
                            {theatreLocation && (
                              <span className="text-sm text-gray-500">
                                {theatreLocation}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 📅 Date */}
                        <td className="py-3 px-4 text-gray-700">{dateLabel}</td>

                        {/* ⏰ Time */}
                        <td className="py-3 px-4 text-gray-700">{timeLabel}</td>

                        {/* 🎦 Screen */}
                        <td className="py-3 px-4 text-center text-gray-800 font-semibold">
                          {show.screenNumber}
                        </td>

                        {/* 🎟️ Action */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => navigate(`/book/${show._id}`)}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:scale-105"
                          >
                            🎟️ Book Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

export default AllShows;
