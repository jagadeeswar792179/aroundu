// src/components/ProfileViewers.jsx
import React, { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "./ProfileViewers.css";
import ProfViewLoad from "../Loading/profviewload";

export default function ProfileViewers({ onClose }) {
  const [viewers, setViewers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [totalUnique, setTotalUnique] = useState(0);

  const token = localStorage.getItem("token");
  const server = process.env.REACT_APP_SERVER;

  const fetchViewers = useCallback(
    async (pageNo = 1) => {
      const res = await fetch(
        `${server}/api/profile-views/me?page=${pageNo}&limit=${limit}`,
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to fetch viewers:", res.status, text);
        setHasMore(false);
        return { viewers: [], total_unique: 0 };
      }

      return res.json();
    },
    [server, token, limit]
  );

  // initial load / reset
  useEffect(() => {
    (async () => {
      setPage(1);
      setHasMore(true);
      const data = await fetchViewers(1);
      const firstBatch = data.viewers || [];
      setViewers(firstBatch);
      setTotalUnique(data.total_unique || 0);
      setHasMore(firstBatch.length === limit);
    })();
  }, [fetchViewers, limit]);

  const loadMore = async () => {
    const nextPage = page + 1;
    const data = await fetchViewers(nextPage);
    const batch = data.viewers || [];
    setViewers((prev) => [...prev, ...batch]);
    setPage(nextPage);
    setHasMore(batch.length === limit);
  };

  return (
    // Give the scroll container a stable id for the library to hook onto
    <div id="pv-scroll" className="pv-wrapper pv-scroll-container">
      <div className="pv-header">
        <div>
          <h3>Profile viewers</h3>
          <span className="pv-count">{totalUnique} unique</span>
        </div>
        <button className="modal-closeBtn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* When there are no items at all */}
      {viewers.length === 0 ? (
        <div className="pv-empty">
          <ProfViewLoad />
        </div>
      ) : (
        <InfiniteScroll
          dataLength={viewers.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<ProfViewLoad />}
          scrollableTarget="pv-scroll" // IMPORTANT: use this container for scrolling (works great inside modals)
        >
          <div className="pv-grid">
            {viewers.map((v) => (
              <div className="pv-card" key={v.id}>
                {v.profile_url ? (
                  <img
                    src={v.profile_url || "/avatar.jpg"}
                    alt={`${v.first_name} ${v.last_name}`}
                    className="pv-avatar"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "/avatar.jpg")}
                  />
                ) : (
                  <div className="profile-view-fallback">
                    {`${v.first_name?.[0] || ""}${
                      v.last_name?.[0] || ""
                    }`.toUpperCase()}
                  </div>
                )}
                <div className="pv-meta">
                  <div className="pv-name">
                    {v.first_name} {v.last_name}
                  </div>
                  {v.university && (
                    <div className="pv-university">{v.university}</div>
                  )}
                  {v.course && <div className="pv-course">{v.course}</div>}
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
        </InfiniteScroll>
      )}
    </div>
  );
}
