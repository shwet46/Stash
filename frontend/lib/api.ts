const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stash_token");
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `API Error: ${res.status}`);
  }

  return res.json();
}

// Inventory
export interface InventoryFilters {
  category?: string;
  godown_id?: string;
  status?: string;
  search?: string;
}

export async function fetchInventory(filters?: InventoryFilters) {
  const params = new URLSearchParams(
    Object.entries(filters || {}).filter(([, v]) => v) as string[][]
  );
  return apiFetch(`/api/inventory?${params}`);
}

export async function updateInventory(id: string, data: Record<string, unknown>) {
  return apiFetch(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Orders
export interface OrderFilters {
  status?: string;
  buyer_id?: string;
  search?: string;
}

export async function fetchOrders(filters?: OrderFilters) {
  const params = new URLSearchParams(
    Object.entries(filters || {}).filter(([, v]) => v) as string[][]
  );
  return apiFetch(`/api/orders?${params}`);
}

export async function createOrder(data: Record<string, unknown>) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Suppliers
export async function fetchSuppliers() {
  return apiFetch("/api/suppliers");
}

// Analytics
export async function fetchDashboardStats() {
  return apiFetch("/api/analytics/summary");
}

export async function fetchAnalytics(period?: string) {
  return apiFetch(`/api/analytics${period ? `?period=${period}` : ""}`);
}

// Billing
export async function fetchBills(status?: string) {
  return apiFetch(`/api/billing${status ? `?status=${status}` : ""}`);
}

export async function generateInvoice(orderId: string) {
  return apiFetch(`/api/billing/generate/${orderId}`, { method: "POST" });
}

// Deliveries
export async function fetchDeliveries() {
  return apiFetch("/api/delivery");
}

// Real-time alerts via SSE
export function subscribeToAlerts(onAlert: (alert: Record<string, unknown>) => void) {
  const es = new EventSource(`${API_BASE}/api/stream/alerts`);
  es.onmessage = (e) => onAlert(JSON.parse(e.data));
  return () => es.close();
}

export { API_BASE };
