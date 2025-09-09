import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ua.css";
import { MdDeleteOutline } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";
const UserActivity = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loggedinuser = JSON.parse(localStorage.getItem("user"))?.id;
  const fetchUserPosts = async (
    append = false,
    limit = 3,
    currentOffset = 0
  ) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user/activity?userId=${userId}&limit=${limit}&offset=${currentOffset}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res.data.length === 0) {
        setHasMore(false);
        return;
      }

      if (append) {
        setPosts((prev) => {
          const merged = [...prev, ...res.data];
          // ✅ remove duplicates by post.id
          return merged.filter(
            (post, index, self) =>
              index === self.findIndex((p) => p.id === post.id)
          );
        });
      } else {
        setPosts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user posts", err);
      toast.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  // ✅ initial load (first 3)
  useEffect(() => {
    fetchUserPosts(false, 3, 0);
  }, []);

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/user/delete/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully");
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error("Failed to delete post");
    }
  };

  // ✅ load more (first +3, then +6 each time)
  const loadMore = () => {
    const newOffset = offset + (offset === 0 ? 3 : 6);
    setOffset(newOffset);
    fetchUserPosts(true, 6, newOffset);
  };

  if (loading)
    return (
      <div
        className="prof-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", // two columns
          gap: "30px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          className="load-4"
          style={{
            width: "230px",
            height: "300px",
            backgroundColor: "#f1f1f1ff",
          }}
        ></div>
        <div
          className="load-4"
          style={{
            width: "230px",
            height: "300px",
            backgroundColor: "#f1f1f1ff",
          }}
        ></div>
        <div
          className="load-4"
          style={{
            width: "230px",
            height: "300px",
            backgroundColor: "#f1f1f1ff",
          }}
        ></div>
      </div>
    );

  if (posts.length === 0) {
    return (
      <div>
        <p className="no-activity">No activity here</p>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="post-image" />
            )}
            {post.id == loggedinuser && (
              <>
                <MdDeleteOutline onClick={() => handleDelete(post.id)} />
              </>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="show-more-container">
          <button onClick={loadMore} className="show-more-btn">
            Show more
          </button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default UserActivity;
