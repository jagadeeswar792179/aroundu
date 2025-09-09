import React, { useEffect, useState } from "react";
import ExploreLoading1 from "../Loading/explore-loading-1";

const LikesModal = ({ postId, onClose }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const server = "https://aroundubackend.onrender.com";
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
        <h3>Likes</h3>
        <div
          className="likes-list"
          style={{
            maxHeight: "600px",
            height: "500px",
            overflowY: "auto",
            padding: "20px",
          }}
          onScroll={handleScroll}
        >
          {users.map((u) => (
            <div key={u.id} className="prof-card" style={{ width: "230px" }}>
              <img
                src={u.avatar_url || "/avatar.jpg"}
                alt="avatar"
                style={{ width: "70px", height: "70px", borderRadius: "50%" }}
              />
              <div>
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
