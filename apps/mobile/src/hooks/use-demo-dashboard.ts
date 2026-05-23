import type { DashboardSummary } from "@interview-battlefield/types";
import { useEffect, useState } from "react";
import { getDemoDashboard } from "../lib/api";

export function useDemoDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDemoDashboard()
      .then((response) => {
        if (mounted) setData(response.data);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, error, loading };
}
