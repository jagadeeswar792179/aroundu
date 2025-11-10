import React, { useEffect, useState } from "react";
import ExploreLoading1 from "../Loading/explore-loading-1";
import { AiOutlineClose } from "react-icons/ai";
import "./LikesModal.css";
const LikesModal = ({ postId, onClose }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const server = process.env.REACT_APP_SERVER;

  const loadLikes = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${server}/api/posts/${postId}/likes?page=${page}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (data.users.length < 20) setHasMore(false);
      setUsers((prev) => [...prev, ...data.users]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load likes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    loadLikes();
  }, [postId]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadLikes();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Likes</h3>
          <AiOutlineClose size={20} className="close-btn" onClick={onClose} />
        </div>
        <div className="likes-list" onScroll={handleScroll}>
          {users.map((u) => (
            <div key={u.id} className="like-card">
              {u.avatar_url ? (
                <img
                  src={u.avatar_url || "/avatar.jpg"}
                  alt="avatar"
                  style={{ width: "35px", height: "35px", borderRadius: "50%" }}
                />
              ) : (
                <div className="likes-avatar-fallback flex-r">
                  {(() => {
                    const full = `${u?.name || ""}`.trim();
                    const parts = full.split(" ").filter(Boolean);

                    const first = parts[0]?.[0] || "";
                    const second = parts[1]?.[0] || "";

                    return (first + second).toUpperCase();
                  })()}
                </div>
              )}
              <div className="like-names">
                <div>{u.name}</div>
                <div>{u.course}</div>
                <div>{u.university}</div>
              </div>
            </div>
          ))}
          {loading && <ExploreLoading1 count={3} />}
          {!loading && users.length === 0 && <p>No likes yet</p>}
        </div>
        {/* <button onClick={onClose}>Close</button> */}
      </div>
    </div>
  );
};

export default LikesModal;
