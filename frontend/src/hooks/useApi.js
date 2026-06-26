import { useState, useEffect, useCallback } from "react";

export function useApi(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try   { setData(await fetchFn()); }
    catch (e) { setError(e.message || "Failed to load data"); }
    finally   { setLoading(false); }
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}
