// src/components/ProfileViewers.jsx
import React, { useEffect, useState } from "react";
import "./ProfileViewers.css";
import ProfViewLoad from "../Loading/profviewload";
export default function ProfileViewers() {
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalUnique, setTotalUnique] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchViewers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchViewers = async (pageNo = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/profile-views/me?page=${pageNo}&limit=${limit}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch viewers:", res.status, text);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setViewers(data.viewers || []);
      setTotalUnique(data.total_unique || 0);
    } catch (err) {
      console.error("Network error fetching viewers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  return (
    <div className="pv-wrapper">
      <h3>Profile viewers</h3>

      {loading ? (
        <ProfViewLoad />
      ) : viewers.length === 0 ? (
        <div>No viewers yet</div>
      ) : (
        <div className="pv-grid">
          {viewers.map((v) => (
            <div className="pv-card" key={v.id}>
              <img
                src={v.profile_url || "/avatar.jpg"}
                alt={`${v.first_name} ${v.last_name}`}
                className="pv-avatar"
              />
              <div className="pv-meta">
                <div className="pv-name">
                  <strong>
                    {v.first_name} {v.last_name}
                  </strong>
                </div>
                <div className="pv-university">{v.university}</div>
                <div className="pv-course">{v.course}</div>
                <div className="pv-time">
                  Viewed: {new Date(v.last_viewed_at).toLocaleString()}
                </div>
              </div>
              <div className="pv-actions">
                <a className="pv-link" href={`/profile/${v.id}`}>
                  View profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pv-pagination">
        <button onClick={handlePrev} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={handleNext} disabled={viewers.length < limit}>
          Next
        </button>
      </div>
    </div>
  );
}
