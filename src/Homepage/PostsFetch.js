// src/components/PostFetch.jsx
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
import { MdImage } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PostUploadModal from "./PostUploadModal";
import PostLoad from "../Loading/postload";

function PostFetch({ profile }) {
  const server = process.env.REACT_APP_SERVER;

  const navigate = useNavigate();

  // try localStorage user first (login stores it), else fallback to profile prop
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const loggedInUserId = storedUser?.id || profile?.id || null;

  const [activeLikesPostId, setActiveLikesPostId] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [likeCounts, setLikeCounts] = useState({}); // postId -> count
  const [likedPosts, setLikedPosts] = useState({});

  // followStatuses: authorId -> 'follow'|'requested'|'friends'
  const [followStatuses, setFollowStatuses] = useState({});
  // loading flags for follow ops
  const [loadingFollowOps, setLoadingFollowOps] = useState({});

  const [activePostId, setActivePostId] = useState(null);

  // Tabs: all | interests | university | course
  const [tab, setTab] = useState("all");

  // selected filters for uni/course (used when user clicks a card or clicks the button)
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // cache per tab: store posts, next page to fetch, hasMore
  const [cache, setCache] = useState({
    all: { posts: [], page: 1, hasMore: true },
    interests: { posts: [], page: 1, hasMore: true },
    university: { posts: [], page: 1, hasMore: true },
    course: { posts: [], page: 1, hasMore: true },
  });

  // helper to set loading flag for a user
  const setFollowLoading = (userId, val) => {
    setLoadingFollowOps((m) => ({ ...m, [userId]: val }));
  };

  // Build endpoint for current tab using cached page
  const buildEndpoint = () => {
    const page = cache[tab]?.page || 1;

    if (tab === "interests") {
      // allow passing filters as well if selected
      let url = `${server}/api/posts/feed/interests?page=${page}`;
      if (selectedUniversity)
        url += `&university=${encodeURIComponent(selectedUniversity)}`;
      if (selectedCourse)
        url += `&course=${encodeURIComponent(selectedCourse)}`;
      return url;
    }

    if (tab === "university") {
      // require selectedUniversity else fallback to storedUser / profile
      const uni =
        selectedUniversity || storedUser?.university || profile?.university;
      return `${server}/api/posts/feed/university?page=${page}&university=${encodeURIComponent(
        uni || ""
      )}`;
    }

    if (tab === "course") {
      const course = selectedCourse || storedUser?.course || profile?.course;
      return `${server}/api/posts/feed/course?page=${page}&course=${encodeURIComponent(
        course || ""
      )}`;
    }

    // default all
    let url = `${server}/api/posts/feed/all?page=${page}`;
    if (selectedUniversity)
      url += `&university=${encodeURIComponent(selectedUniversity)}`;
    if (selectedCourse) url += `&course=${encodeURIComponent(selectedCourse)}`;
    return url;
  };

  // Fetch posts for current tab (uses cache[tab].page)
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = buildEndpoint();

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newPosts = res.data.posts || [];

      if (!newPosts || newPosts.length === 0) {
        // update cache and UI
        setHasMore(false);
        setCache((prev) => ({
          ...prev,
          [tab]: { ...prev[tab], hasMore: false },
        }));
        return;
      }

      // hydrate like/saved/follow states for new posts
      const likes = {};
      const counts = {};
      const saved = {};
      const newFollowStatuses = {};
      newPosts.forEach((p) => {
        likes[p.id] = !!p.liked_by_me;
        counts[p.id] = Number(p.like_count) || 0;
        saved[p.id] = !!p.saved_by_me;
        if (p.follow_status) newFollowStatuses[p.user_id] = p.follow_status;
      });
      setLikedPosts((prev) => ({ ...prev, ...likes }));
      setLikeCounts((prev) => ({ ...prev, ...counts }));
      setSavedPosts((prev) => ({ ...prev, ...saved }));
      setFollowStatuses((prev) => ({ ...prev, ...newFollowStatuses }));

      // update cache (avoid duplicates)
      setCache((prev) => {
        const existingIds = new Set(prev[tab].posts.map((p) => p.id));
        const unique = newPosts.filter((p) => !existingIds.has(p.id));
        return {
          ...prev,
          [tab]: {
            posts: [...prev[tab].posts, ...unique],
            page: prev[tab].page + 1,
            hasMore: true,
          },
        };
      });

      // append to visible posts (dedupe)
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...unique];
      });

      setHasMore(true);
    } catch (err) {
      console.error("fetchPosts error:", err);
      setHasMore(false);
    }
  };

  // When tab or selected filters change, restore from cache or fetch new
  useEffect(() => {
    const c = cache[tab];
    // If cache has posts and the filter matches (we treat selectedUniversity/course as part of identity)
    if (c && c.posts && c.posts.length > 0) {
      setPosts(c.posts);
      setHasMore(c.hasMore);
      return;
    }
    // reset visible posts & fetch fresh
    setPosts([]);
    setHasMore(true);
    // ensure page is set to 1 in cache for this tab when starting fresh
    setCache((prev) => ({
      ...prev,
      [tab]: { posts: [], page: 1, hasMore: true },
    }));
    // fetch first page
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedUniversity, selectedCourse]);

  // initial load
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FOLLOW helpers (send / cancel / unfollow)
  const sendFollowRequest = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "follow";
    setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
    setFollowLoading(targetId, true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${server}/api/follow/${targetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const serverStatus = res.data?.status || res.data?.follow_status;
      if (serverStatus === "accepted" || serverStatus === "friends")
        setFollowStatuses((s) => ({ ...s, [targetId]: "friends" }));
      else setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
    } catch (err) {
      console.error("Failed to send follow request", err);
      setFollowStatuses((s) => ({ ...s, [targetId]: prev }));
      alert("Could not send follow request");
    } finally {
      setFollowLoading(targetId, false);
    }
  };

  const cancelFollowRequest = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "follow";
    setFollowStatuses((s) => ({ ...s, [targetId]: "follow" }));
    setFollowLoading(targetId, true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${server}/api/follow/${targetId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to cancel follow request", err);
      setFollowStatuses((s) => ({ ...s, [targetId]: prev }));
      alert("Could not cancel request");
    } finally {
      setFollowLoading(targetId, false);
    }
  };

  const unfollow = async (targetId) => {
    if (!targetId) return;
    const prev = followStatuses[targetId] || "friends";
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

  // Likes (optimistic)
  const toggleLike = async (postId) => {
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
      setLikedPosts((prev) => ({ ...prev, [postId]: res.data.liked_by_me }));
      setLikeCounts((prev) => ({ ...prev, [postId]: res.data.like_count }));
    } catch (err) {
      console.error("❌ Failed to toggle like:", err);
      // rollback
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: (prev[postId] || 0) + (currentlyLiked ? 1 : -1),
      }));
    }
  };

  // Save toggle
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

  // Handle post upload (PostUploadModal should pass file, caption, tags, optionally visibility)
  const handlePost = async (file, caption, tags, visibility = "public") => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      formData.append("caption", caption || "");
      formData.append("tags", JSON.stringify(tags || []));
      formData.append("visibility", visibility);

      const uploadRes = await fetch(`${server}/api/posts/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      alert("✅ Post uploaded successfully");
      const resJson = await uploadRes.json();
      const newPost = resJson.post || resJson;

      // Prepend to UI if it matches current filters (or if tab has no restricting filter)
      const matchesUni =
        !selectedUniversity ||
        selectedUniversity === newPost.user?.university ||
        tab !== "university";
      const matchesCourse =
        !selectedCourse ||
        selectedCourse === newPost.user?.course ||
        tab !== "course";

      if (matchesUni && matchesCourse) setPosts((prev) => [newPost, ...prev]);

      // also insert into cache for current tab
      setCache((prev) => {
        const has = prev[tab].posts.some((p) => p.id === newPost.id);
        return {
          ...prev,
          [tab]: {
            ...prev[tab],
            posts: has ? prev[tab].posts : [newPost, ...prev[tab].posts],
          },
        };
      });

      // init engagement states
      setLikedPosts((prev) => ({
        ...prev,
        [newPost.id]: newPost.liked_by_me || false,
      }));
      setLikeCounts((prev) => ({
        ...prev,
        [newPost.id]: newPost.like_count || 0,
      }));
      setSavedPosts((prev) => ({
        ...prev,
        [newPost.id]: newPost.saved_by_me || false,
      }));
      if (newPost.follow_status)
        setFollowStatuses((s) => ({
          ...s,
          [newPost.user_id]: newPost.follow_status,
        }));

      setModalOpen(false);
    } catch (err) {
      console.error("handlePost error", err);
      alert("❌ Failed to upload post");
    }
  };

  // render the simple follow-status div
  const renderFollowStatusDiv = (authorId) => {
    if (!authorId || authorId === loggedInUserId) return null;

    const status = followStatuses[authorId] || "follow";
    const loading = !!loadingFollowOps[authorId];

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

    return (
      <div
        role="button"
        onClick={async () => {
          if (loading) return;
          const current = followStatuses[authorId] || "follow";
          if (current !== "follow") return;

          setFollowStatuses((s) => ({ ...s, [authorId]: "requested" }));
          setLoadingFollowOps((m) => ({ ...m, [authorId]: true }));

          try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
              `${server}/api/follow/${authorId}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const serverStatus = res.data?.status || res.data?.follow_status;
            if (serverStatus === "accepted" || serverStatus === "friends")
              setFollowStatuses((s) => ({ ...s, [authorId]: "friends" }));
            else setFollowStatuses((s) => ({ ...s, [authorId]: "requested" }));
          } catch (err) {
            console.error("Failed to send follow request", err);
            setFollowStatuses((s) => ({ ...s, [authorId]: "follow" }));
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

  // Header button handlers
  const onClickAll = () => {
    setTab("all");
    setSelectedUniversity(null);
    setSelectedCourse(null);
  };
  const onClickInterests = () => {
    setTab("interests");
    setSelectedUniversity(null);
    setSelectedCourse(null);
  };
  const onClickSameUniversity = () => {
    const uni = storedUser?.university || profile?.university;
    if (!uni) {
      alert("Please set your university in profile to use this filter.");
      return;
    }
    setSelectedUniversity(uni);
    setSelectedCourse(null);
    setTab("university");
    // reset cache page for university so we fetch fresh from page 1
    setCache((prev) => ({
      ...prev,
      university: { posts: [], page: 1, hasMore: true },
    }));
  };
  const onClickSameCourse = () => {
    const course = storedUser?.course || profile?.course;
    if (!course) {
      alert("Please set your course in profile to use this filter.");
      return;
    }
    setSelectedCourse(course);
    setSelectedUniversity(null);
    setTab("course");
    setCache((prev) => ({
      ...prev,
      course: { posts: [], page: 1, hasMore: true },
    }));
  };

  // clicking on a post's university or course will switch to that tab and filter
  // const onClickPostUniversity = (uni) => {
  //   if (!uni) return;
  //   setSelectedUniversity(uni);
  //   setSelectedCourse(null);
  //   setTab("university");
  //   setCache((prev) => ({
  //     ...prev,
  //     university: { posts: [], page: 1, hasMore: true },
  //   }));
  // };
  // const onClickPostCourse = (course) => {
  //   if (!course) return;
  //   setSelectedCourse(course);
  //   setSelectedUniversity(null);
  //   setTab("course");
  //   setCache((prev) => ({
  //     ...prev,
  //     course: { posts: [], page: 1, hasMore: true },
  //   }));
  // };

  return (
    <>
      <div className="homecontainer-2">
        <div className="postcontainer">
          <div className="postwrite-container">
            <img
              src={profile?.profile || "/avatar.jpg"}
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
            onClick={onClickAll}
            className={`switch-btn ${tab === "all" ? "active" : ""}`}
          >
            All
          </button>
          <button
            onClick={onClickInterests}
            className={`switch-btn ${tab === "interests" ? "active" : ""}`}
          >
            Interests
          </button>
          <button
            onClick={onClickSameUniversity}
            className={`switch-btn ${tab === "university" ? "active" : ""}`}
          >
            Same University
          </button>
          <button
            onClick={onClickSameCourse}
            className={`switch-btn ${tab === "course" ? "active" : ""}`}
          >
            Same Course
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
                          if (post.user_id !== loggedInUserId)
                            navigate(`/profile/${post.user_id}`);
                        }}
                      >
                        {`${post.user?.first_name || ""} ${
                          post.user?.last_name || ""
                        }`.trim() || "Unknown User"}
                      </b>

                      <p
                      // style={{
                      //   cursor: post.user?.course ? "pointer" : "default",
                      //   textDecoration: post.user?.course
                      //     ? "underline"
                      //     : "none",
                      // }}
                      // onClick={() => onClickPostCourse(post.user?.course)}
                      >
                        {post.user?.course}
                      </p>
                      <p
                      // style={{
                      //   cursor: post.user?.university ? "pointer" : "default",
                      //   textDecoration: post.user?.university
                      //     ? "underline"
                      //     : "none",
                      // }}
                      // onClick={() =>
                      //   onClickPostUniversity(post.user?.university)
                      // }
                      >
                        {post.user?.role} at {post.user?.university}
                      </p>
                    </div>
                  </div>

                  {/* Follow status DIV */}
                  {renderFollowStatusDiv(post.user_id)}
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
                      if (post.user_id !== loggedInUserId)
                        navigate(`/profile/${post.user_id}`);
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
                        onClick={() => navigate(`/tag/${tag}`)}
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
            style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}
          >
            No posts found.
          </div>
        )}
      </div>
    </>
  );
}

export default PostFetch;
