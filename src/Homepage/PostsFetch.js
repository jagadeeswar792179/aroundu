import Line from "../utils/line";
import InfiniteScroll from "react-infinite-scroll-component";
import TimeAgo from "../utils/TimeAgo";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentModal from "./CommentModal";
import { RiVideoFill } from "react-icons/ri";
import axios from "axios";
import { useState, useEffect } from "react";
import LikesModal from "./LikesModal";
import { FaRegCommentDots, FaShare, FaBookmark } from "react-icons/fa";
import { MdArticle, MdImage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PostUploadModal from "./PostUploadModal";
import PostLoad from "../Loading/postload";

function PostFetch({ profile }) {
  const server = "https://aroundubackend.onrender.com";
  const navigate = useNavigate();
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [activeLikesPostId, setActiveLikesPostId] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likeCounts, setLikeCounts] = useState({}); // postId -> count
  const [likedPosts, setLikedPosts] = useState({});

  // followStatuses: authorId -> 'follow'|'requested'|'friends'
  const [followStatuses, setFollowStatuses] = useState({});
  // loading flags for follow ops
  const [loadingFollowOps, setLoadingFollowOps] = useState({});

  const [activePostId, setActivePostId] = useState(null);

  // 🟢 new states for caching + tab
  const [tab, setTab] = useState("all"); // "all" | "interests"
  const [cache, setCache] = useState({
    all: { posts: [], page: 1, hasMore: true },
    interests: { posts: [], page: 1, hasMore: true },
  });

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");

    // 🟢 pick endpoint based on tab
    const endpoint =
      tab === "interests"
        ? `${server}/api/posts/feed/interests?page=${cache[tab].page}`
        : `${server}/api/posts/feed/all?page=${cache[tab].page}`;

    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newPosts = res.data.posts;

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      setCache((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], hasMore: false },
      }));
      return;
    }

    // Avoid duplicates
    setPosts((prev) => {
      const newSet = new Set(prev.map((p) => p.id));
      const unique = newPosts.filter((p) => !newSet.has(p.id));
      return [...prev, ...unique];
    });

    // hydrate like/saved/follow states
    const likes = {};
    const counts = {};
    const saved = {};
    const newFollowStatuses = {};
    newPosts.forEach((p) => {
      likes[p.id] = p.liked_by_me;
      counts[p.id] = p.like_count;
      saved[p.id] = p.saved_by_me;
      if (p.follow_status) newFollowStatuses[p.user_id] = p.follow_status;
    });
    setLikedPosts((prev) => ({ ...prev, ...likes }));
    setLikeCounts((prev) => ({ ...prev, ...counts }));
    setSavedPosts((prev) => ({ ...prev, ...saved }));
    setFollowStatuses((prev) => ({ ...prev, ...newFollowStatuses }));

    // ✅ update cache only
    setCache((prev) => {
      const existingIds = new Set(prev[tab].posts.map((p) => p.id));
      const unique = newPosts.filter((p) => !existingIds.has(p.id));
      const updated = {
        posts: [...prev[tab].posts, ...unique],
        page: prev[tab].page + 1,
        hasMore: true,
      };
      return { ...prev, [tab]: updated };
    });

    // ✅ sync posts from cache
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const unique = newPosts.filter((p) => !existingIds.has(p.id));
      return [...prev, ...unique];
    });

    setPage((prev) => prev + 1);
    setHasMore(true);
  };

  // 🟢 When tab changes
  useEffect(() => {
    if (cache[tab].posts.length > 0) {
      // restore from cache
      setPosts(cache[tab].posts);
      setPage(cache[tab].page);
      setHasMore(cache[tab].hasMore);
    } else {
      // fetch fresh
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // helper to set loading flag for a user
  const setFollowLoading = (userId, val) => {
    setLoadingFollowOps((m) => ({ ...m, [userId]: val }));
  };

  // send follow request (current user -> target)
  const sendFollowRequest = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "follow";
    // optimistic
    setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
    setFollowLoading(targetId, true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${server}/api/follow/${targetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // server may return { status: 'pending' } or { status: 'accepted' } etc.
      const serverStatus = res.data?.status || res.data?.follow_status;
      if (serverStatus === "accepted" || serverStatus === "friends") {
        setFollowStatuses((s) => ({ ...s, [targetId]: "friends" }));
      } else if (serverStatus === "pending" || serverStatus === "requested") {
        setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
      } else {
        // default
        setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
      }
    } catch (err) {
      console.error("Failed to send follow request", err);
      // rollback
      setFollowStatuses((s) => ({ ...s, [targetId]: prev }));
      alert("Could not send follow request");
    } finally {
      setFollowLoading(targetId, false);
    }
  };

  // cancel follow request (only if current user had requested)
  const cancelFollowRequest = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "follow";
    // optimistic
    setFollowStatuses((s) => ({ ...s, [targetId]: "follow" }));
    setFollowLoading(targetId, true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${server}/api/follow/${targetId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // success -> already set to 'follow'
    } catch (err) {
      console.error("Failed to cancel follow request", err);
      // rollback
      setFollowStatuses((s) => ({ ...s, [targetId]: prev }));
      alert("Could not cancel request");
    } finally {
      setFollowLoading(targetId, false);
    }
  };

  // unfollow (if accepted)
  const unfollow = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "friends";
    // optimistic
    setFollowStatuses((s) => ({ ...s, [targetId]: "follow" }));
    setFollowLoading(targetId, true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${server}/api/follow/${targetId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to unfollow", err);
      setFollowStatuses((s) => ({ ...s, [targetId]: prev }));
      alert("Could not unfollow");
    } finally {
      setFollowLoading(targetId, false);
    }
  };

  const toggleLike = async (postId) => {
    // Optimistic UI update
    const currentlyLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (currentlyLiked ? -1 : 1),
    }));

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${server}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // sync with backend response (in case of mismatch)
      setLikedPosts((prev) => ({ ...prev, [postId]: res.data.liked_by_me }));
      setLikeCounts((prev) => ({ ...prev, [postId]: res.data.like_count }));
    } catch (err) {
      console.error("❌ Failed to toggle like:", err);

      // rollback if API failed
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: (prev[postId] || 0) + (currentlyLiked ? 1 : -1),
      }));
    }
  };

  const handlePost = async (file, caption, tags) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption);
      formData.append("tags", JSON.stringify(tags));

      const uploadRes = await fetch(`${server}/api/posts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const newPost = await uploadRes.json();

      // ✅ Prepend new post instantly
      setPosts((prev) => [newPost, ...prev]);

      // ✅ Initialize like/comment state for new post
      setLikedPosts((prev) => ({
        ...prev,
        [newPost.id]: newPost.liked_by_me || false,
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [newPost.id]: newPost.like_count || 0,
      }));

      // initialize follow status for the newly created post's author (if provided)
      if (newPost.follow_status) {
        setFollowStatuses((s) => ({
          ...s,
          [newPost.user_id]: newPost.follow_status,
        }));
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to upload post");
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // render the simple follow-status div per your requirement:
  // only three states shown: 'follow' | 'requested' | 'friends'
  // Put this inside PostFetch (replace the previous renderFollowStatusDiv)
  const renderFollowStatusDiv = (authorId) => {
    if (!authorId || authorId === loggedInUserId) return null;

    const status = followStatuses[authorId] || "follow";
    const loading = !!loadingFollowOps[authorId];

    // If state is friends -> static label
    if (status === "friends") {
      return (
        <div
          className="follow-status-div friends"
          style={{
            marginLeft: "auto",
            fontWeight: 600,
            color: "#2e7d32",
            padding: "6px 10px",
          }}
        >
          Friends
        </div>
      );
    }

    // If state is requested -> show label + small cancel button (no clickable div)
    if (status === "requested") {
      return (
        <div className="requested-wrapper">
          <span className="requested-badge">Requested</span>
          <button
            onClick={() => cancelFollowRequest(authorId)}
            disabled={loading}
            className={`cancel-btn ${loading ? "disabled" : ""}`}
          >
            Cancel
          </button>
        </div>
      );
    }

    // Default state is "follow" — make the entire div clickable
    // Only respond to clicks when not loading and when status === 'follow'
    return (
      <div
        role="button"
        onClick={async () => {
          // guard: only act if the current status still 'follow' and not loading
          if (loading) return;
          const current = followStatuses[authorId] || "follow";
          if (current !== "follow") return;

          // optimistic UI
          setFollowStatuses((s) => ({ ...s, [authorId]: "requested" }));
          setLoadingFollowOps((m) => ({ ...m, [authorId]: true }));

          try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
              `${server}/api/follow/${authorId}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // server may return status 'pending' or 'accepted'
            const serverStatus = res.data?.status || res.data?.follow_status;
            if (serverStatus === "accepted" || serverStatus === "friends") {
              setFollowStatuses((s) => ({ ...s, [authorId]: "friends" }));
            } else {
              setFollowStatuses((s) => ({ ...s, [authorId]: "requested" }));
            }
          } catch (err) {
            console.error("Failed to send follow request", err);
            // rollback
            setFollowStatuses((s) => ({ ...s, [authorId]: "follow" }));
            // optional: show a toast / alert
            alert("Could not send follow request. Try again.");
          } finally {
            setLoadingFollowOps((m) => ({ ...m, [authorId]: false }));
          }
        }}
        className={`follow-btn ${loading ? "disabled" : ""}`}
        aria-disabled={loading}
      >
        {!loading && <span className="follow-text">Follow</span>}
        {loading && <span className="follow-loading">Sending...</span>}
      </div>
    );
  };

  return (
    <>
      <div className="homecontainer-2">
        <div className="postcontainer">
          <div className="postwrite-container">
            <img
              src={profile?.profile || "/avatar.jpg"} // replace with your profile image url
              alt="profile"
              className="postwrite-avatar"
            />
            <input
              className="postwrite-input"
              type="text"
              placeholder="Write something"
            />
          </div>

          <div className="postcontainer-2">
            <div className="postcontainer-2-1">
              <RiVideoFill className="icon icon1" title="Video" size={24} />
              <p>Video</p>
            </div>
            <div className="postcontainer-2-1">
              <MdImage
                className="icon icon2"
                title="Photo"
                size={24}
                onClick={() => setModalOpen(true)}
                style={{ cursor: "pointer" }}
              />

              {modalOpen && (
                <PostUploadModal
                  isOpen={modalOpen}
                  onClose={() => setModalOpen(false)}
                  onPost={handlePost}
                />
              )}
              <p>Photo</p>
            </div>
            {/* <div className="postcontainer-2-1">
              <MdArticle
                className="icon icon3"
                title="Write Article"
                size={24}
              />
              <p>Write Article</p>
            </div> */}
          </div>
        </div>
        <Line
          length={550}
          size={1}
          color={"black"}
          center={true}
          padding={10}
          transparency={0.3}
        />
        <div className="switch-container">
          <button
            onClick={() => setTab("all")}
            className={`switch-btn ${tab === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setTab("interests")}
            className={`switch-btn ${tab === "interests" ? "active" : ""}`}
          >
            Interests
          </button>
        </div>

        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={<PostLoad />}
        >
          {posts.map((post) => (
            <div className="feed-container" key={post.id}>
              <div className="feed-container-sep">
                <div className="feed-container-1">
                  <div style={{ display: "flex" }}>
                    <img
                      src={post.user?.avatar_url || "/avatar.jpg"}
                      className="icon"
                      alt="profile"
                    />
                    <div className="feed-container-1-2">
                      <b
                        className={`username ${
                          post.user_id !== loggedInUserId ? "clickable" : ""
                        }`}
                        onClick={() => {
                          if (post.user_id !== loggedInUserId) {
                            navigate(`/profile/${post.user_id}`);
                          }
                        }}
                      >
                        {`${post.user?.first_name || ""} ${
                          post.user?.last_name || ""
                        }`.trim() || "Unknown User"}
                      </b>

                      <p>{post.user?.course}</p>
                      <p>{post.user?.university}</p>
                    </div>
                  </div>

                  {/* Follow status DIV */}
                  {renderFollowStatusDiv(post.user_id, post)}
                </div>
              </div>

              <div className="feed-container-2">
                <img
                  src={post.image_url}
                  alt="post"
                  className="feed-image"
                  style={{
                    width: "570px",
                    height: "500px",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="feed-container-3-2">
                <div className="feed-container-3-2-1">
                  <div
                    onClick={() => toggleLike(post.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {likedPosts[post.id] ? (
                      <FaHeart size={24} color="red" />
                    ) : (
                      <FaRegHeart size={24} color="black" />
                    )}
                  </div>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveLikesPostId(post.id)}
                  >
                    {likeCounts[post.id] ?? 0}
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
                    onClick={() => setActivePostId(post.id)}
                  />
                  <span>{post.comment_count}</span>
                </div>

                <div className="feed-container-3-2-1">
                  <FaShare title="Share" size={24} className="icon" />
                </div>
                <div
                  className="feed-container-3-2-1"
                  onClick={() => toggleSave(post.id)}
                  style={{ cursor: "pointer" }}
                >
                  {savedPosts[post.id] ? (
                    <FaBookmark size={24} color="black" />
                  ) : (
                    <FaBookmark size={24} color="gray" />
                  )}
                </div>
              </div>
              <Line
                length={550}
                size={1}
                color={"black"}
                center={true}
                transparency={0.3}
              />
              <div className="feed-container-4">
                <div className="feed-container-4-1">
                  <b
                    className={`username ${
                      post.user_id !== loggedInUserId ? "clickable" : ""
                    }`}
                    onClick={() => {
                      if (post.user_id !== loggedInUserId) {
                        navigate(`/profile/${post.user_id}`);
                      }
                    }}
                  >
                    {`${post.user?.first_name || ""} ${
                      post.user?.last_name || ""
                    }`.trim() || "Unknown User"}
                  </b>
                  {post.caption}
                </div>

                <div className="feed-container-4-2">
                  {post.tags &&
                    post.tags.map((tag, i) => (
                      <p
                        key={i}
                        className="tags-tab"
                        onClick={() => {
                          navigate(`/tag/${tag}`);
                        }}
                      >
                        #{tag}
                      </p>
                    ))}
                </div>

                <div className="post-meta">
                  <TimeAgo timestamp={post.created_at} />
                </div>
              </div>
            </div>
          ))}
          {/* Render modal AFTER the list to avoid duplication */}
          {activePostId && (
            <CommentModal
              postId={activePostId}
              onClose={() => setActivePostId(null)}
              onCommentAdded={() => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === activePostId
                      ? { ...p, comment_count: (p.comment_count || 0) + 1 }
                      : p
                  )
                );
              }}
            />
          )}
        </InfiniteScroll>

        {posts.length === 0 && !hasMore && (
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              color: "#888",
            }}
          >
            No posts found.
          </div>
        )}
      </div>
    </>
  );
}
export default PostFetch;
