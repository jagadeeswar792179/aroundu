import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import "./SavedPosts.css";
import Line from "../utils/line";
import TimeAgo from "../utils/TimeAgo";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentModal from "./CommentModal";
import axios from "axios";
import LikesModal from "./LikesModal";
import { FaRegCommentDots, FaShare, FaBookmark } from "react-icons/fa";
import Navbar from "./Navbar";

function SavedPosts() {
  const server = process.env.REACT_APP_SERVER;

  const [activePostId, setActivePostId] = useState(null);
  const [savedTab, setSavedTab] = useState("posts"); // "posts" | "discussion"

  const [savedPostsState, setSavedPostsState] = useState({}); // postId -> saved_by_me
  const [savedPosts, setSavedPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likeCounts, setLikeCounts] = useState({}); // postId -> count
  const [likedPosts, setLikedPosts] = useState({});
  const [activeLikesPostId, setActiveLikesPostId] = useState(null);

  const toggleLike = async (postId) => {
    // Optimistic UI update
    const currentlyLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: prev[postId] + (currentlyLiked ? -1 : 1),
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${server}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      <div></div>;

      // sync with backend response (in case of mismatch)
      setLikedPosts((prev) => ({ ...prev, [postId]: res.data.liked_by_me }));
      setLikeCounts((prev) => ({ ...prev, [postId]: res.data.like_count }));
    } catch (err) {
      console.error("❌ Failed to toggle like:", err);

      // rollback if API failed
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: prev[postId] + (currentlyLiked ? 1 : -1),
      }));
    }
  };

  const fetchSavedPosts = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${server}/api/user/saved-posts?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPosts = res.data.posts;

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      // Avoid duplicates
      setSavedPosts((prev) => {
        const newSet = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !newSet.has(p.id));
        return [...prev, ...unique];
      });

      // Set saved state for toggle UI
      const savedState = {};
      newPosts.forEach((p) => {
        savedState[p.id] = p.saved_by_me ?? false;
      });
      setSavedPostsState((prev) => ({ ...prev, ...savedState }));

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error fetching saved posts:", err);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);
  const toggleSave = async (postId) => {
    const currentlySaved = savedPosts[postId];
    setSavedPosts((prev) => ({ ...prev, [postId]: !currentlySaved }));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${server}/api/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedPosts((prev) => ({ ...prev, [postId]: res.data.saved }));
    } catch (err) {
      console.error("❌ Failed to toggle saved post:", err);
      setSavedPosts((prev) => ({ ...prev, [postId]: currentlySaved }));
    }
  };
  const filteredSavedPosts = savedPosts.filter((post) => {
    if (savedTab === "posts") {
      return post.post_type !== "discussion"; // only non-discussion
    }
    if (savedTab === "discussion") {
      return post.post_type === "discussion"; // only discussion
    }
    return true;
  });

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="saved-posts-container">
          <div className="saved-posts-header">
            <h3>Saved Posts</h3>
          </div>
          <div>
            {savedPosts.length === 0 ? (
              <div
                className="prof-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)", // two columns
                  gap: "40px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {[...Array(1)].map((_, index) => (
                  <div
                    className="load-4"
                    style={{
                      width: "230px",
                      height: "300px",
                      backgroundColor: "#f1f1f1ff",
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              <>
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

                <InfiniteScroll
                  dataLength={filteredSavedPosts.length} // use filtered length
                  next={fetchSavedPosts}
                  hasMore={hasMore}
                  // endMessage={
                  //   <p className="no-posts">
                  //     {savedTab === "posts"
                  //       ? "You have seen all saved posts"
                  //       : "You have seen all saved discussions"}
                  //   </p>
                  // }
                >
                  <div className="grid-container">
                    {filteredSavedPosts.map((post) => (
                      <div
                        key={post.id}
                        className="grid-item"
                        onClick={() => setSelectedPost(post)}
                      >
                        {post.image_url ? (
                          <img src={post.image_url} alt={post.title} />
                        ) : (
                          <div className="feed-container">
                            <b>
                              {post?.user?.first_name}
                              {post?.user?.last_name}
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
              </>
            )}
          </div>

          {selectedPost && (
            <div>
              {selectedPost && (
                <div
                  className="modal-overlay"
                  onClick={() => setSelectedPost(null)}
                >
                  <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="feed-container">
                      <div className="feed-container-sep">
                        <div
                          className="feed-container-1"
                          style={{ justifyContent: "flex-start" }}
                        >
                          <img
                            src={selectedPost.user?.avatar_url || "/avatar.jpg"}
                            className="icon"
                            alt="profile"
                          />
                          <div className="feed-container-1-2">
                            <b>
                              {`${selectedPost.user?.first_name || ""} ${
                                selectedPost.user?.last_name || ""
                              }`.trim() || "Unknown User"}
                            </b>
                            <p>{selectedPost.user?.course}</p>
                            <p>{selectedPost.user?.university}</p>
                          </div>
                        </div>
                      </div>

                      <div className="feed-container-2">
                        {selectedPost.image_url && (
                          <img
                            src={selectedPost.image_url}
                            alt="post"
                            className="feed-image"
                          />
                        )}
                      </div>

                      {/* <div className="feed-container-3-2">
                        <div className="feed-container-3-2-1">
                          <div
                            onClick={() => toggleLike(selectedPost.id)}
                            style={{ cursor: "pointer" }}
                          >
                            {likedPosts[selectedPost.id] ? (
                              <FaHeart size={24} color="red" />
                            ) : (
                              <FaRegHeart size={24} color="black" />
                            )}
                          </div>
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setActiveLikesPostId(selectedPost.id)
                            }
                          >
                            {likeCounts[selectedPost.id] ?? 0}
                          </span>
                          {activeLikesPostId && (
                            <LikesModal
                              postId={activeLikesPostId}
                              onClose={() => setActiveLikesPostId(null)}
                            />
                          )}
                        </div>

                        <div className="feed-container-3-2-1">
                          <FaRegCommentDots
                            title="Comments"
                            size={24}
                            onClick={() => setActivePostId(selectedPost.id)}
                          />
                          <span>{selectedPost.comment_count ?? 0}</span>
                        </div>

                        <div className="feed-container-3-2-1">
                          <FaShare title="Share" size={24} className="icon" />
                        </div>

                        <div
                          className="feed-container-3-2-1"
                          onClick={() => toggleSave(selectedPost.id)}
                          style={{ cursor: "pointer" }}
                        >
                          {savedPosts[selectedPost.id] ? (
                            <FaBookmark size={24} color="blue" />
                          ) : (
                            <FaBookmark size={24} color="gray" />
                          )}
                        </div>
                      </div> */}

                      <div className="feed-container-4">
                        <div className="feed-container-4-1">
                          <b>
                            {`${selectedPost.user?.first_name || ""} ${
                              selectedPost.user?.last_name || ""
                            }`.trim() || "Unknown User"}{" "}
                          </b>
                          {selectedPost.caption || selectedPost.description}
                        </div>

                        <div className="feed-container-4-2">
                          {selectedPost.tags &&
                            selectedPost.tags.map((tag, i) => (
                              <a
                                href="https://example.com"
                                key={i}
                                className="tags-tab"
                                rel="noopener noreferrer"
                              >
                                #{tag}
                              </a>
                            ))}
                        </div>

                        <div className="post-meta">
                          <TimeAgo timestamp={selectedPost.created_at} />
                        </div>
                      </div>

                      {/* <button
                    className="close-modal-btn"
                    onClick={() => setSelectedPost(null)}
                  >
                    Close
                  </button> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SavedPosts;
