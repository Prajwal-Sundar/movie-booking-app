// ===========================
// HTTP Methods Enum-like Object
// ===========================
export const HttpMethod = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const);
export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

// ===========================
// API Endpoints Enum-like Object
// ===========================

export const ApiEndpoint = Object.freeze({
  // 🩺 Health Check
  HEALTHCHECK: { url: "healthcheck", method: HttpMethod.GET },

  // 👤 Auth
  REGISTER_USER: { url: "registerUser", method: HttpMethod.POST },
  LOGIN_USER: { url: "loginUser", method: HttpMethod.POST },

  // 🎭 Theatres
  ADD_THEATRE: { url: "addTheatre", method: HttpMethod.POST },
  GET_THEATRES: { url: "getTheatres", method: HttpMethod.GET },
  UPDATE_THEATRE: { url: "updateTheatre", method: HttpMethod.PUT },
  DELETE_THEATRE: { url: "deleteTheatre", method: HttpMethod.DELETE },

  // 🎬 Shows
  ADD_SHOW: { url: "addShow", method: HttpMethod.POST },
  GET_SHOWS: { url: "getShows", method: HttpMethod.GET },
  UPDATE_SHOW: { url: "updateShow", method: HttpMethod.PUT },
  DELETE_SHOW: { url: "deleteShow", method: HttpMethod.DELETE },

  // 🎟️ User-Facing
  GET_SHOWS_USER: { url: "getShowsUser", method: HttpMethod.GET },
  GET_SHOW_SEATS: { url: "getShowSeats", method: HttpMethod.GET },
  BOOK_SEATS: { url: "bookSeats", method: HttpMethod.POST },
  GET_USER_BOOKINGS: { url: "getUserBookings", method: HttpMethod.GET },
  CANCEL_BOOKING: { url: "cancelBooking", method: HttpMethod.DELETE },
} as const);

export type ApiEndpoint = (typeof ApiEndpoint)[keyof typeof ApiEndpoint];

// ===========================
// Enhanced API Caller
// ===========================

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
  [key: string]: any; // Allow flexible extra fields like token, user, etc.
}

export async function apiCaller<T = any>(
  endpoint: ApiEndpoint,
  payload?: Record<string, any>
): Promise<ApiResponse<T>> {
  const { url, method } = endpoint;
  const token = localStorage.getItem("authToken"); // ✅ consistent with AuthContext
  const isGet = method === HttpMethod.GET;

  // Construct URL
  let finalUrl = `/api/${url}`;
  if (isGet && payload && Object.keys(payload).length > 0) {
    const params = new URLSearchParams(payload).toString();
    finalUrl += `?${params}`;
  }

  // Prepare fetch options
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(isGet ? {} : { body: JSON.stringify(payload) }),
  };

  try {
    const res = await fetch(finalUrl, options);
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : {};

    // ✅ Success
    if (res.ok) {
      return {
        success: true,
        status: res.status,
        ...data,
      };
    }

    // ❌ Handle known errors
    let message =
      data?.message ||
      res.statusText ||
      "An unexpected error occurred. Please try again.";

    if (res.status === 400 && !data.message)
      message = "Bad request - Please check your input.";
    else if (res.status === 401)
      message = "Unauthorized - Please login again.";
    else if (res.status === 403)
      message = "Forbidden - You don't have permission to perform this action.";
    else if (res.status === 404)
      message = "Resource not found.";
    else if (res.status >= 500)
      message = "Internal Server Error - Please contact admin.";

    return {
      success: false,
      status: res.status,
      message,
      ...data,
    };
  } catch (error: any) {
    // 🛑 Network or unexpected runtime error
    console.error("API Caller Error:", error);
    return {
      success: false,
      status: 500,
      message: "Network error - Please check your connection.",
    };
  }
}
