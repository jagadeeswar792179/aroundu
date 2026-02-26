// src/components/PostFetch.jsx
import Line from "../utils/line";
import "./PostsFetch.css";
import InfiniteScroll from "react-infinite-scroll-component";
import TimeAgo from "../utils/TimeAgo";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentModal from "./CommentModal";
import axios from "axios";
import { useState, useEffect } from "react";
import LikesModal from "./LikesModal";
import { FaShare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PostUploadModal from "./PostUploadModal";
import PostLoad from "../Loading/postload";
import DiscussionUploadModal from "./DiscussionUploadModal";
import ReportModal from "../utils/ReportModal";
import BlockConfirmModal from "../utils/BlockConfirmModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// ...
function PostFetch({ profile }) {
  const server = process.env.REACT_APP_SERVER;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // { kind: 'post'|'user', postId?, userId? }
  const [reportTargetLabel, setReportTargetLabel] = useState("");
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockTargetUserId, setBlockTargetUserId] = useState(null);
  const [blockTargetName, setBlockTargetName] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const reportModalKey = reportTarget
    ? `${reportTarget.kind}-${reportTarget.postId || reportTarget.userId}`
    : "none";
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const loggedInUserId = storedUser?.id || profile?.id || null;
  const [discussionModalOpen, setDiscussionModalOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [activeLikesPostId, setActiveLikesPostId] = useState(null);
  const [savedPosts, setSavedPosts] = useState({});
  const [followStatuses, setFollowStatuses] = useState({});
  const [activePostId, setActivePostId] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
} = useInfiniteQuery({
  queryKey: ["posts", tab, selectedUniversity, selectedCourse],
  queryFn: async ({ pageParam = 1 }) => {
    const token = localStorage.getItem("token");

    const endpoint = buildEndpoint(pageParam);

    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  },
  getNextPageParam: (lastPage, pages) => {
    if (!lastPage.posts || lastPage.posts.length === 0) return undefined;
    return pages.length + 1;
  },
  staleTime: 1000 * 60 * 5,
  keepPreviousData: true,
});

  useEffect(() => {
  if (data) {
    const merged = data.pages.flatMap(page => page.posts);
    setPosts(merged);
  }
}, [data]);


  // Build endpoint for current tab using cached page
  const buildEndpoint = (page) => {

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


const likeMutation = useMutation({
  mutationFn: async (postId) => {
    const token = localStorage.getItem("token");
    return axios.patch(
      `${server}/api/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });

    const previousData = queryClient.getQueriesData({ queryKey: ["posts"] });

    previousData.forEach(([key, data]) => {
      if (!data) return;

      queryClient.setQueryData(key, old => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            posts: page.posts.map(post =>
              post.id === postId
                ? {
                    ...post,
                    liked_by_me: !post.liked_by_me,
                    like_count: post.liked_by_me
                      ? post.like_count - 1
                      : post.like_count + 1,
                  }
                : post
            ),
          })),
        };
      });
    });

    return { previousData };
  },

  onError: (err, postId, context) => {
    context.previousData.forEach(([key, data]) => {
      queryClient.setQueryData(key, data);
    });
  },
});

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

  const handleCreateDiscussion = async (
    content,
    visibility = "public",
    tags = []
  ) => {
    try {
      // Basic validation client-side
      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        throw new Error("Content is required");
      }

      // ensure tags is an array of strings and max 7
      const cleanTags = Array.isArray(tags)
        ? tags
            .map((t) => String(t).trim())
            .filter(Boolean)
            .slice(0, 7)
        : [];

      const token = localStorage.getItem("token"); // adapt if you use a different store
      const res = await fetch(`${server}/api/posts/discussion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          tags: cleanTags,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const errMsg = errBody.error || `Server returned ${res.status}`;
        throw new Error(errMsg);
      }

      const resJson = await res.json();
      const newPost = resJson.post || resJson; // be defensive: server returns {post: {...}} or post directly

      // === Decide if the newly created post should be visible in current feed/tab ===
      // (match your client-side filters; adjust logic to match your implementation)
      const matchesUniversity =
        !selectedUniversity ||
        newPost.user?.university === selectedUniversity ||
        tab !== "university";
      const matchesCourse =
        !selectedCourse ||
        newPost.user?.course === selectedCourse ||
        tab !== "course";

      if (matchesUniversity && matchesCourse) {
        // Prepend to visible posts
        setPosts((prev) => {
          // avoid duplicate if it somehow exists
          const already = prev.some((p) => p.id === newPost.id);
          return already ? prev : [newPost, ...prev];
        });
      }

     
      setSavedPosts((prev) => ({
        ...prev,
        [newPost.id]: !!newPost.saved_by_me,
      }));

      return newPost;
    } catch (err) {
      console.error("handleCreateDiscussion error:", err);
      // surface a user-friendly message or rethrow for the caller to handle
      throw err;
    }
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
  
  };

  // open report modals
  const openPostReportModal = (post) => {
    setReportTarget({
      kind: "post",
      postId: post.id,
      userId: post.user_id,
    });
    setReportTargetLabel("this post");
    setReportModalOpen(true);
    setOpenMenuPostId(null);
  };

  const openUserReportModal = (post) => {
    setReportTarget({
      kind: "user",
      userId: post.user_id,
    });
    setReportTargetLabel(
      `${post.user?.first_name || ""} ${post.user?.last_name || ""}`.trim() ||
        "this person"
    );
    setReportModalOpen(true);
    setOpenMenuPostId(null);
  };

  // submit report to backend
  const handleSubmitReport = async ({ type, reason }) => {
    if (!reportTarget || isSubmittingReport) return; // prevent double-click
    try {
      setIsSubmittingReport(true);

      const token = localStorage.getItem("token");

      if (reportTarget.kind === "post") {
        await axios.post(
          `${server}/api/moderation/report/post/${reportTarget.postId}`,
          { type, reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Thank you. The post has been reported.");
      } else {
        await axios.post(
          `${server}/api/moderation/report/user/${reportTarget.userId}`,
          { type, reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Thank you. The user has been reported.");
      }
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
      setReportModalOpen(false);
      setReportTarget(null);
    }
  };

  // open block modal
  const openBlockModal = (post) => {
    setBlockTargetUserId(post.user_id);
    setBlockTargetName(
      `${post.user?.first_name || ""} ${post.user?.last_name || ""}`.trim() ||
        "this person"
    );
    setBlockModalOpen(true);
    setOpenMenuPostId(null);
  };

  // confirm block: API + remove posts
  const handleConfirmBlock = async () => {
    if (!blockTargetUserId || isBlocking) return;
    try {
      setIsBlocking(true);

      const token = localStorage.getItem("token");
      await axios.post(
        `${server}/api/moderation/block/${blockTargetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // remove their posts from feed
      setPosts((prev) => prev.filter((p) => p.user_id !== blockTargetUserId));

    

      alert(`You blocked ${blockTargetName || "this person"}.`);
    } catch (err) {
      console.error("Block error:", err);
      alert("Could not block user. Please try again.");
    } finally {
      setIsBlocking(false);
      setBlockModalOpen(false);
      setBlockTargetUserId(null);
      setBlockTargetName("");
    }
  };

  const contentdivform = (post) => {
    return (
      <div className="feed-container-4">
        <div className="feed-container-4-1">
          {/* <b
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
          </b> */}
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
    );
  };
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuPostId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <ReportModal
        key={reportModalKey} // 👈 this forces fresh state per target
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportTarget(null);
        }}
        onSubmit={handleSubmitReport}
        targetLabel={reportTargetLabel}
        isSubmitting={isSubmittingReport}
      />

      <BlockConfirmModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        targetName={blockTargetName}
        isBlocking={isBlocking}
      />

      <div className="homecontainer-2">
        <div className="postcontainer">
          <div className="postwrite-container">
            {profile?.profile ? (
              <img
                src={profile?.profile || "/avatar.jpg"}
                alt="profile"
                className="postwrite-avatar"
              />
            ) : (
              <div className="avatar-fallback">
                {/* {`${profile.first_name?.[0] || ""}${
                  profile.last_name?.[0] || ""
                }`.toUpperCase()} */}
              </div>
            )}
            <input
              className="postwrite-input"
              type="text"
              placeholder="Write something"
              readOnly
              onClick={() => setDiscussionModalOpen(true)}
            />
            {discussionModalOpen && (
              <DiscussionUploadModal
                isOpen={discussionModalOpen}
                onClose={() => setDiscussionModalOpen(false)}
                onCreate={handleCreateDiscussion}
              />
            )}
          </div>

          <div className="postcontainer-2">
            <div className="postcontainer-2-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon3"
              >
                <path d="m16 13 5.3 3.3a1 1 0 0 0 1.7-.7V8.4a1 1 0 0 0-1.7-.7L16 11" />
                <path d="M2 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2z" />
              </svg>

              {/* <RiVideoFill  title="Video" size={24} /> */}
              <p>Video</p>
            </div>
            <div className="postcontainer-2-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-image"
                className="icon icon1"
                title="Photo"
                onClick={() => setModalOpen(true)}
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.08-4.11a2 2 0 0 0-3.14-.14L11 15" />
              </svg>

              {/* <MdImage
                className="icon icon2"
                title="Photo"
                size={24}
                onClick={() => setModalOpen(true)}
                style={{ cursor: "pointer" }}
              /> */}
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
         next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<PostLoad />}
        >
          {posts.map((post) => (

            
            <div className="feed-container" key={post.id}>
              <div className="feed-container-sep">
                <div className="feed-container-1">
                  <div style={{ display: "flex", gap: "10px" }}>
                    {post.user?.avatar_url ? (
                      <img
                      className="avatar-img"
                        src={post.user.avatar_url}
                        alt="profile"
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {`${post.user?.first_name?.[0] || ""}${
                          post.user?.last_name?.[0] || ""
                        }`.toUpperCase()}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "40px",
                        width: "100%",
                      }}
                    >
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

                        <p>{post.user?.course}</p>
                        <p>
                          {post.user?.role} at {post.user?.university}
                        </p>
                      </div>
                      {post.user_id !== loggedInUserId && (
                        <div className="kebab-wrapper">
                          <div
                            className="kebab-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuPostId(
                                openMenuPostId === post.id ? null : post.id
                              );
                            }}
                          >
                            ⋮
                          </div>

                          {openMenuPostId === post.id && (
                            <div className="kebab-menu">
                              <div
                                className="kebab-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPostReportModal(post);
                                }}
                              >
                                Report this post
                              </div>

                              <div
                                className="kebab-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUserReportModal(post);
                                }}
                              >
                                Report this person
                              </div>

                              <div
                                className="kebab-item danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBlockModal(post);
                                }}
                              >
                                Block this person
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {post.post_type === "photo" && (
                <div className="feed-container-2">
                  <img src={post.image_url} alt="post" className="feed-image" />
                </div>
              )}

              {post.post_type === "discussion" && <>{contentdivform(post)}</>}

              <div className="feed-container-3-2">
                <div className="feed-container-3-2-1">
                  <div
                    onClick={() => likeMutation.mutate(post.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {post.liked_by_me ? (
                      <FaHeart size={24} color="red" />
                    ) : (
                      <FaRegHeart size={24} color="#747474ff" />
                    )}
                  </div>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveLikesPostId(post.id)}
                  >
                    {post.like_count ?? 0}
                  </span>
                  {activeLikesPostId && (
                    <LikesModal
                      postId={activeLikesPostId}
                      onClose={() => setActiveLikesPostId(null)}
                    />
                  )}
                </div>

                <div className="feed-container-3-2-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    color="#747474ff"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    onClick={() => setActivePostId(post.id)}
                  >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                  </svg>
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
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="#205b99"
                      color="#205b99"
                    >
                      <path
                        d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15.5L12 17l-7.5 3.5V5A1.5 1.5 0 0 1 6 3.5Z"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      color="#205b99"
                    >
                      <path
                        d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15.5L12 17l-7.5 3.5V5A1.5 1.5 0 0 1 6 3.5Z"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {post.post_type === "photo" && <>{contentdivform(post)}</>}
            </div>

          ))
          

          }

          {activePostId && (
            <CommentModal
              postId={activePostId}
              onClose={() => setActivePostId(null)}
             onCommentAdded={() => {
  queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map(page => ({
        ...page,
        posts: page.posts.map(post =>
          post.id === activePostId
            ? { ...post, comment_count: (post.comment_count || 0) + 1 }
            : post
        ),
      })),
    };
  });
}}
            />
          )}
        </InfiniteScroll>

        {posts.length === 0  && (
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
