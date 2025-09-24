// src/components/Feed.jsx
import React, { useEffect, useState, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import PostCard from "./PostCard";
import LikesModal from "./LikesModal";
import CommentModal from "./CommentModal";
import PostUploadModal from "./PostUploadModal";
import PostLoad from "../Loading/postload";

/**
 * Props:
 * - fetchUrlBuilder(page): string | {url, params}
 * - onNavigateProfile(userId)
 * - onTagNavigate(tag)
 */
export default function Feed({
  fetchUrlBuilder,
  onNavigateProfile,
  onTagNavigate,
  autoFetchOnMount = true,
}) {
  const server = process.env.REACT_APP_SERVER;

  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [activeLikesPostId, setActiveLikesPostId] = useState(null);
  const [activePostId, setActivePostId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const urlOrObj = fetchUrlBuilder(page);
      let res;
      if (typeof urlOrObj === "string") {
        res = await axios.get(urlOrObj, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page },
        });
      } else {
        res = await axios.get(urlOrObj.url, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...(urlOrObj.params || {}), page },
        });
      }
      const newPosts = res.data.posts || [];
      if (!newPosts.length) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const unique = newPosts.filter((p) => !prevIds.has(p.id));
        return [...prev, ...unique];
      });

      const likes = {},
        counts = {},
        saved = {};
      newPosts.forEach((p) => {
        likes[p.id] = p.liked_by_me ?? false;
        counts[p.id] = p.like_count ?? 0;
        saved[p.id] = p.saved_by_me ?? false;
      });

      setLikedPosts((prev) => ({ ...prev, ...likes }));
      setLikeCounts((prev) => ({ ...prev, ...counts }));
      setSavedPosts((prev) => ({ ...prev, ...saved }));
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Failed to fetch posts:", err);
      setHasMore(false);
    }
  }, [fetchUrlBuilder, page]);

  useEffect(() => {
    if (autoFetchOnMount) fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLike = async (postId) => {
    const currentlyLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + (currentlyLiked ? -1 : 1),
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
      console.error("❌ toggleLike failed:", err);
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? 0) + (currentlyLiked ? 1 : -1),
      }));
    }
  };

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
      console.error("❌ toggleSave failed:", err);
      setSavedPosts((prev) => ({ ...prev, [postId]: currentlySaved }));
    }
  };

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setLikedPosts((prev) => ({
      ...prev,
      [newPost.id]: newPost.liked_by_me ?? false,
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [newPost.id]: newPost.like_count ?? 0,
    }));
  };

  return (
    <>
      <div className="homecontainer-2">
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={<PostLoad />}
        >
          {posts.map((post) => (
            <React.Fragment key={post.id}>
              <PostCard
                post={post}
                loggedInUserId={loggedInUserId}
                liked={likedPosts[post.id]}
                likeCount={likeCounts[post.id]}
                onToggleLike={toggleLike}
                onOpenLikes={(id) => setActiveLikesPostId(id)}
                onOpenComments={(id) => setActivePostId(id)}
                onToggleSave={toggleSave}
                saved={savedPosts[post.id]}
                onNavigateProfile={onNavigateProfile}
                onTagClick={(t) => onTagNavigate?.(t)}
              />
            </React.Fragment>
          ))}
        </InfiniteScroll>

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

        {activeLikesPostId && (
          <LikesModal
            postId={activeLikesPostId}
            onClose={() => setActiveLikesPostId(null)}
          />
        )}

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
