"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  fetchOwnerDashboard, 
  fetchOperatorDashboard, 
  fetchWorkerDashboard,
  subscribeToDashboard,
  DashboardRole,
  OwnerDashboardData,
  OperatorDashboardData,
  WorkerDashboardData
} from "@/lib/api";

type DashboardDataMap = {
  owner: OwnerDashboardData;
  admin: OwnerDashboardData;
  operator: OperatorDashboardData;
  worker: WorkerDashboardData;
};

export function useDashboardData<T extends keyof DashboardDataMap>(role: T) {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<DashboardDataMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let result;
      if (role === "owner" || role === "admin") {
        result = await fetchOwnerDashboard();
      } else if (role === "operator") {
        result = await fetchOperatorDashboard();
      } else {
        result = await fetchWorkerDashboard();
      }
      setData(result as DashboardDataMap[T]);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchData();

      // Subscribe to real-time updates via SSE
      const normalizedRole = (role === "admin" ? "owner" : role) as DashboardRole;
      const unsubscribe = subscribeToDashboard<DashboardDataMap[T]>(
        normalizedRole,
        (newData) => {
          setData(newData);
          setIsRealtime(true);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn("SSE Connection failed, falling back to polling", err);
          setIsRealtime(false);
        }
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
