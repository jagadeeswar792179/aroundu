import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ua.css";
import { MdDeleteOutline } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";



import SinglePostModal from "./SinglePostModal";
const UserActivity = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [activePostId, setActivePostId] = useState(null);

  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [activityTab, setActivityTab] = useState("posts"); // "posts" | "discussion"

  const server = process.env.REACT_APP_SERVER;
  const loggedinuser = JSON.parse(localStorage.getItem("user"))?.id;
  const fetchUserPosts = async (
    append = false,
    limit = 3,
    currentOffset = 0
  ) => {
    try {
      const res = await axios.get(
        `${server}/api/user/activity?userId=${userId}&limit=${limit}&offset=${currentOffset}`,
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
      await axios.delete(`${server}/api/user/delete/${postId}`, {
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
  const filteredPosts = posts.filter((post) => {
    if (activityTab === "posts") {
      return post.post_type !== "discussion"; // only non-discussion posts
    }
    if (activityTab === "discussion") {
      return post.post_type === "discussion"; // only discussion posts
    }
    return true;
  });

  return (
    <div className="activity-container">
{activePostId && (
  <SinglePostModal
    postId={activePostId}
    onClose={() => setActivePostId(null)}
  />
)}


      <div className="switch-container">
        <button
          onClick={() => setActivityTab("posts")}
          className={`switch-btn ${activityTab === "posts" ? "active" : ""}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActivityTab("discussion")}
          className={`switch-btn ${
            activityTab === "discussion" ? "active" : ""
          }`}
        >
          Discussion
        </button>
      </div>

      <div className="posts-grid">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">
            {activityTab === "posts" ? "No posts yet." : "No discussions yet."}
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              {post.image_url ? (
                <>
                  <img
  src={post.image_url}
  className="post-image"
onClick={() => setActivePostId(post.id)}

/>

                  {userId == loggedinuser && (
                    <button
                      className="delete-btn"
                      aria-label="Delete post"
                      onClick={() => handleDelete(post.id)}
                      title="Delete post"
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  )}
                </>
              ) : (
                // optional: show something for discussion without image
                <div className="feed-container" style={{ padding: "20px" }}>
                  <b>
                    {post.first_name}
                    {post.last_name}
                  </b>
                  {userId == loggedinuser && (
                    <button
                      className="delete-btn"
                      aria-label="Delete post"
                      onClick={() => handleDelete(post.id)}
                      title="Delete post"
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  )}
                  <div className="user-activity-caption">{post.caption}</div>
                </div>
              )}
            </div>
          ))
        )}
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
