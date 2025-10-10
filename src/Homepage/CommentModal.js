import React, { useEffect, useState } from "react";
import "./CommentModal.css";
import TimeAgo from "../utils/TimeAgo";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import ExploreLoading1 from "../Loading/explore-loading-1";
const CommentModal = ({ postId, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const server = process.env.REACT_APP_SERVER;

  const loadComments = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${server}/api/posts/${postId}/comments?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();

      if (data.comments.length < 10) setHasMore(false);
      setComments((prev) => [...prev, ...data.comments]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
    setLoading(false);
  };
  const toggleCommentLike = async (commentId) => {
    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              liked_by_me: !c.liked_by_me,
              like_count: (c.like_count ?? 0) + (c.liked_by_me ? -1 : 1),
            }
          : c
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${server}/api/posts/comments/${commentId}/like`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked_by_me: data.liked,
                like_count: data.like_count,
              }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Failed to toggle like:", err);

      // Rollback if API fails
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked_by_me: !c.liked_by_me,
                like_count: c.like_count + (c.liked_by_me ? 1 : -1),
              }
            : c
        )
      );
    }
  };

  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    loadComments();
    // eslint-disable-next-line
  }, [postId]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadComments();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`${server}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      const newC = await res.json();
      setComments((prev) => [
        {
          ...newC,
          like_count: newC.like_count ?? 0,
          liked_by_me: newC.liked_by_me ?? false,
        },
        ...prev,
      ]);
      setNewComment("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
    setPosting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-heading">
          <b>Comments</b>
          <AiOutlineClose size={20} className="close-btn" onClick={onClose} />
        </div>

        <div className="comment-list" onScroll={handleScroll}>
          {comments.length === 0 && !loading && (
            <p className="no-comments">No comments added yet.</p>
          )}

          {comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <img
                src={comment.user.avatar_url || "/avatar.jpg"}
                alt="avatar"
                className="comment-avatar"
              />
              <div className="comment-1">
                <div className="comment-1-1">
                  <strong>{comment.user.name}</strong>
                  <p>{comment.content}</p>
                  <TimeAgo timestamp={comment.created_at} />
                </div>

                <div
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    padding: "10px 0 0 0",
                    gap: "5px",
                  }}
                  onClick={() => toggleCommentLike(comment.id)}
                >
                  {comment.liked_by_me ? (
                    <FaHeart size={16} color="red" />
                  ) : (
                    <FaRegHeart size={16} color="black" />
                  )}
                  <span>{comment.like_count ?? 0}</span>
                </div>
              </div>
            </div>
          ))}

          {!loading && <ExploreLoading1 count={5} />}
        </div>

        <div className="comment-input-box">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={posting}
            className="comment-input"
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto"; // reset height
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px"; // grow upto 120px
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={posting || !newComment.trim()}
            className="comment-submit-btn"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
