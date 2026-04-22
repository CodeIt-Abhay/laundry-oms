const BASE = import.meta.env.VITE_API_URL;

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text); // helps debug HTML errors
  }

  if (!res.ok) {
    const msg = data.errors?.join(", ") || "Something went wrong";
    throw new Error(msg);
  }

  return data;
}

export const api = {
  getDashboard: () => http("/dashboard"),

  getOrders: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return http(`/orders${qs ? "?" + qs : ""}`);
  },

  getOrder: (id) => http(`/orders/${id}`),

  createOrder: (body) =>
    http("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateStatus: (id, status) =>
    http(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};