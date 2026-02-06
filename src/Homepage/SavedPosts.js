import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import "./SavedPosts.css";
import SinglePostModal from "../profile/SinglePostModal";
import Navbar from "./Navbar";

function SavedPosts() {
  const server = process.env.REACT_APP_SERVER;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activePostId, setActivePostId] = useState(null);
  const [savedTab, setSavedTab] = useState("posts"); // posts | discussion
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${server}/api/user/saved-posts?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newPosts = res.data.posts || [];

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !seen.has(p.id));
        return [...prev, ...unique];
      });

      setPage((p) => p + 1);
    } catch (err) {
      console.error("❌ Failed to fetch saved posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (savedTab === "posts") return post.post_type !== "discussion";
    if (savedTab === "discussion") return post.post_type === "discussion";
    return true;
  });

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>

      <div className="container-2">
        <div className="saved-posts-container">
          <h3>Saved Posts</h3>

          {/* Tabs */}
          <div className="switch-container">
            <button
              onClick={() => setSavedTab("posts")}
              className={`switch-btn ${
                savedTab === "posts" ? "active" : ""
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setSavedTab("discussion")}
              className={`switch-btn ${
                savedTab === "discussion" ? "active" : ""
              }`}
            >
              Discussion
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && posts.length === 0 && (
            <div
              className="prof-2"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "30px",
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="load-4"
                  style={{
                    width: "230px",
                    height: "300px",
                    backgroundColor: "#f1f1f1ff",
                  }}
                />
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && filteredPosts.length === 0 ? (
            <p className="no-posts">
              {savedTab === "posts"
                ? "No saved posts yet."
                : "No saved discussions yet."}
            </p>
          ) : (
            <InfiniteScroll
              dataLength={filteredPosts.length}
              next={fetchSavedPosts}
              hasMore={hasMore}
              loader={<p style={{ textAlign: "center" }}></p>}
            >
              <div className="grid-container">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="grid-item">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt="saved post"
                        onClick={() => setActivePostId(post.id)}
                      />
                    ) : (
                      <div
                        className="feed-container"
                        onClick={() => setActivePostId(post.id)}
                        style={{ padding: "15px", cursor: "pointer" }}
                      >
                        <b>
                          {post.first_name} {post.last_name}
                        </b>
                        <div className="user-activity-caption">
                          {post.caption}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>

      {/* 🔥 SINGLE POST MODAL */}
      {activePostId && (
        <SinglePostModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
        />
      )}
    </>
  );
}

export default SavedPosts;
