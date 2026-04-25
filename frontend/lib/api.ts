/**
 * Extended API client with role-specific dashboard endpoints and SSE support.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

// ─────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────
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

export async function fetchInventoryStats() {
  return apiFetch<{
    total_products: number;
    low_stock_count: number;
    critical_count: number;
    categories: number;
  }>("/api/inventory/summary/stats");
}

export async function updateInventory(id: string, data: Record<string, unknown>) {
  return apiFetch(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function createInventoryItem(data: Record<string, unknown>) {
  return apiFetch("/api/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createSupplier(data: Record<string, unknown>) {
  return apiFetch("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─────────────────────────────────────────
// Orders
// ─────────────────────────────────────────
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

export async function updateOrderStatus(orderId: string, status: string) {
  return apiFetch(`/api/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ─────────────────────────────────────────
// Suppliers
// ─────────────────────────────────────────
export async function fetchSuppliers() {
  return apiFetch("/api/suppliers");
}

// ─────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────
export async function fetchDashboardStats() {
  return apiFetch("/api/analytics/summary");
}

export async function fetchAnalytics(period?: string) {
  return apiFetch(`/api/analytics${period ? `?period=${period}` : ""}`);
}

// ─────────────────────────────────────────
// Billing
// ─────────────────────────────────────────
export async function fetchBills(status?: string) {
  return apiFetch(`/api/billing${status ? `?status=${status}` : ""}`);
}

export async function generateInvoice(orderId: string) {
  return apiFetch(`/api/billing/generate/${orderId}`, { method: "POST" });
}

// ─────────────────────────────────────────
// Deliveries
// ─────────────────────────────────────────
export async function fetchDeliveries(accessToken?: string) {
  if (accessToken) {
    return apiFetch("/api/delivery", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return apiFetch("/api/delivery");
}

// ─────────────────────────────────────────
// Role-Specific Dashboard Data (Firestore + BigQuery)
// ─────────────────────────────────────────
export type DashboardRole = "admin" | "worker";

export async function fetchAdminDashboard() {
  return apiFetch<AdminDashboardData>("/api/dashboard/admin");
}

export async function fetchWorkerDashboard() {
  return apiFetch<WorkerDashboardData>("/api/dashboard/worker");
}

export async function fetchDashboardSummary() {
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}

// ─────────────────────────────────────────
// TypeScript interfaces for dashboard data
// ─────────────────────────────────────────
export interface AdminStats {
  monthly_revenue: number;
  active_orders: number;
  total_orders: number;
  inventory_value: number;
  total_products: number;
  low_stock_count: number;
  critical_count: number;
  pending_payments: number;
  collected_revenue: number;
  supplier_count: number;
  buyer_count: number;
  deliveries_in_transit: number;
  voice_calls_today: number;
  staff_count: number;
  worker_count: number;
}

export interface StockItem {
  id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  unit: string;
  status: "healthy" | "low" | "critical";
}

export interface RecentOrder {
  id: string;
  order_ref: string;
  quantity: number;
  status: string;
  total_amount: number;
  created_at: string;
  estimated_delivery?: string;
}

export interface RecentBill {
  id: string;
  bill_ref: string;
  amount: number;
  total: number;
  status: string;
  created_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface AdminDashboardData {
  role: "admin";
  stats: AdminStats;
  revenue_history: { date: string; revenue: number; orders: number }[];
  category_distribution: { name: string; value: number; count: number }[];
  low_stock_items: StockItem[];
  recent_orders: RecentOrder[];
  recent_bills: RecentBill[];
  staff: StaffMember[];
  last_updated: string;
}




export interface DeliveryItem {
  id: string;
  order_id: string | null;
  status: string;
  note: string | null;
  updated_at: string;
}

export interface WorkerTask {
  id: string;
  task: string;
  product: string;
  qty: string;
  location: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  due_time: string;
  source: "order" | "inventory";
}

export interface WorkerStats {
  total_tasks: number;
  pending_tasks: number;
  voice_calls_today: number;
  active_deliveries: number;
  low_stock_count: number;
}

export interface WorkerDashboardData {
  role: "worker";
  stats: WorkerStats;
  tasks: WorkerTask[];
  recent_calls: { id: string; text: string; time: string; status: string }[];
  active_deliveries: DeliveryItem[];
  last_updated: string;
}

export interface DashboardSummary {
  total_products: number;
  active_orders: number;
  monthly_revenue: number;
  low_stock_count: number;
  critical_count: number;
  pending_payments: number;
  last_updated: string;
}

// ─────────────────────────────────────────
// SSE — Real-time streaming
// ─────────────────────────────────────────
export function subscribeToAlerts(onAlert: (alert: Record<string, unknown>) => void) {
  const es = new EventSource(`${API_BASE}/api/stream/alerts`);
  es.onmessage = (e) => onAlert(JSON.parse(e.data));
  return () => es.close();
}

export function subscribeToDashboard<T>(
  role: DashboardRole,
  onData: (data: T) => void,
  onError?: (err: Event) => void
): () => void {
  const token = getToken();
  const url = `${API_BASE}/api/dashboard/stream/${role}${token ? `?token=${token}` : ""}`;
  const es = new EventSource(url);
  es.onmessage = (e) => {
    try {
      onData(JSON.parse(e.data));
    } catch {
      // ignore parse errors
    }
  };
  if (onError) es.onerror = onError;
  return () => es.close();
}

export { API_BASE };
