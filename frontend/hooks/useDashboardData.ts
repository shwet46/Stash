"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  fetchAdminDashboard, 
  fetchWorkerDashboard,
  subscribeToDashboard,
  DashboardRole,
  AdminDashboardData,
  WorkerDashboardData
} from "@/lib/api";

type DashboardDataMap = {
  admin: AdminDashboardData;
  worker: WorkerDashboardData;
};

export function useDashboardData<T extends keyof DashboardDataMap>(role: T) {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<DashboardDataMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);

  const fetchData = useCallback(async () => {
    const userName = (session?.user as any)?.name;
    try {
      setLoading(true);
      let result;
      // Handle admin/owner interchangeably
      const normalizedRole = (role as string).toLowerCase();
      if (normalizedRole === "admin" || normalizedRole === "owner") {
        result = await fetchAdminDashboard(userName);
      } else {
        result = await fetchWorkerDashboard(userName);
      }
      setData(result as DashboardDataMap[T]);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [role, session]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchData();

      const userName = (session?.user as any)?.name;
      // Subscribe to real-time updates via SSE
      const normalizedRole = (role as string).toLowerCase() === "admin" || (role as string).toLowerCase() === "owner" ? "admin" : "worker";
      const unsubscribe = subscribeToDashboard<DashboardDataMap[T]>(
        normalizedRole as DashboardRole,
        (newData) => {
          setData(newData);
          setIsRealtime(true);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn("SSE Connection failed, falling back to polling", err);
          setIsRealtime(false);
        },
        userName
      );

      // Fallback polling if SSE fails or as a safety measure
      const pollInterval = setInterval(() => {
        if (!isRealtime) {
          fetchData();
        }
      }, 30000); // 30s poll if not realtime

      return () => {
        unsubscribe();
        clearInterval(pollInterval);
      };
    }
  }, [authStatus, role, fetchData, isRealtime]);

  return { data, loading, error, isRealtime, refetch: fetchData };
}
