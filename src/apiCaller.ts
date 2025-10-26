export const HttpMethod = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const);
type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod];

export async function apiCaller(
  functionName: string,
  method: HttpMethod = HttpMethod.GET,
  payload?: any
) {
  const token = localStorage.getItem('token');

  const url = `/api/${functionName}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  };

  const res = await fetch(url, options);

  if (res.status === 401) {
    throw new Error('Unauthorized: Please login');
  }

  if (res.status === 403) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  return res.json();
}
