import React, { useState, useEffect, useMemo } from "react";
import './../styles/App.css';

const API = "https://jsonplaceholder.typicode.com/posts";

const App = () => {
  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // persistent cache, created once
  const cache = useMemo(() => new Map(), []);

  useEffect(() => {
    const key = userId || "all";

    if (cache.has(key)) {
      setPosts(cache.get(key));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const url = userId ? `${API}?userId=${userId}` : API;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        cache.set(key, data);
        setPosts(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, cache]);

  // memoized rendering
  const postList = useMemo(
    () =>
      posts.map((p) => (
        <li key={p.id}>
          <strong>{p.title}</strong>
          <p>{p.body}</p>
        </li>
      )),
    [posts]
  );

  return (
    <div>
      {/* Do not remove the main div */}
      <h1>Cached API</h1>

      <select value={userId} onChange={(e) => setUserId(e.target.value)}>
        <option value="">All users</option>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
          <option key={id} value={id}>User {id}</option>
        ))}
      </select>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && <ul>{postList}</ul>}
    </div>
  );
};

export default App;