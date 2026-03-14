import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../constants/api";

export function useArticles(eventId) {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    fetch(`${API_ENDPOINTS.articles}?eventId=${eventId}&limit=10`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setArticles(json.articles ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  return { articles, loading, error };
}
