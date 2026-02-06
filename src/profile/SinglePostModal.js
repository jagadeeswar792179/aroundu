import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../Homepage/PostCard";
import CommentModal from "../Homepage/CommentModal";
import LikesModal from "../Homepage/LikesModal";


export default function SinglePostModal({ postId, onClose }) {
  const server = process.env.REACT_APP_SERVER;
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const [activePostId, setActivePostId] = useState(null);
  const [activeLikesPostId, setActiveLikesPostId] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await axios.get(`${server}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setPost(res.data);
      setLiked(res.data.liked_by_me);
      setLikeCount(res.data.like_count);
      setSaved(res.data.saved_by_me);
    };

    fetchPost();
  }, [postId]);

  const toggleLike = async () => {
    setLiked((p) => !p);
    setLikeCount((c) => c + (liked ? -1 : 1));

    try {
      const res = await axios.patch(
        `${server}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLiked(res.data.liked_by_me);
      setLikeCount(res.data.like_count);
    } catch {
      // rollback
      setLiked((p) => !p);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  };

  const toggleSave = async () => {
    setSaved((s) => !s);
    try {
      const res = await axios.post(
        `${server}/api/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSaved(res.data.saved);
    } catch {
      setSaved((s) => !s);
    }
  };

  if (!post) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-single-post"
        onClick={(e) => e.stopPropagation()}
      >
        <PostCard
          post={post}
          loggedInUserId={loggedInUserId}
          liked={liked}
          likeCount={likeCount}
          saved={saved}
          onToggleLike={toggleLike}
          onOpenLikes={() => setActiveLikesPostId(post.id)}
          onOpenComments={() => setActivePostId(post.id)}
          onToggleSave={toggleSave}
        />

        {activePostId && (
          <CommentModal
            postId={activePostId}
            onClose={() => setActivePostId(null)}
          />
        )}

        {activeLikesPostId && (
          <LikesModal
            postId={activeLikesPostId}
            onClose={() => setActiveLikesPostId(null)}
          />
        )}
      </div>
    </div>
  );
}
