// src/components/PostCard.jsx
import React from "react";
import {
  FaHeart,
  FaRegHeart,
  FaRegCommentDots,
  FaShare,
  FaBookmark,
} from "react-icons/fa";
import TimeAgo from "../utils/TimeAgo";
import Line from "../utils/line";
import { useNavigate } from "react-router-dom";
export default function PostCard({
  post,
  loggedInUserId,
  liked,
  likeCount,
  onToggleLike,
  onOpenLikes,
  onOpenComments,
  onToggleSave,
  saved,
  onNavigateProfile,
  onTagClick, // NEW: callback when tag clicked
}) {
  const navigate = useNavigate();
  const contentdivform = (post) => {
    return (
      <div className="feed-container-4">
        <div className="feed-container-4-1">{post.caption}</div>

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

  return (
    <div className="feed-container" key={post.id}>
      <div className="feed-container-sep">
        <div className="feed-container-1">
          <div style={{ display: "flex", gap: "10px" }}>
            {post.user?.avatar_url ? (
              <img src={post.user.avatar_url} className="icon" alt="profile" />
            ) : (
              <div className="avatar-fallback">
                {`${post.user?.first_name?.[0] || ""}${
                  post.user?.last_name?.[0] || ""
                }`.toUpperCase()}
              </div>
            )}
            <div className="feed-container-1-2">
              <b
                // style={{
                //   cursor:
                //     post.user_id !== loggedInUserId ? "pointer" : "default",
                // }}
                className={`username ${
                  post.user_id !== loggedInUserId ? "clickable" : ""
                }`}
                onClick={() => {
                  if (post.user_id !== loggedInUserId && onNavigateProfile)
                    onNavigateProfile(post.user_id);
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
        </div>
      </div>

      {post.post_type === "photo" && (
        <div className="feed-container-2">
          <img src={post.image_url} alt="post" className="feed-image" />
        </div>
      )}
      {post.post_type === "discussion" && <>{contentdivform(post)}</>}
      <div className="feed-container-3-2">
        <div
          className="feed-container-3-2-1"
          onClick={() => onToggleLike(post.id)}
          style={{ cursor: "pointer" }}
        >
          {liked ? <FaHeart size={24} color="red" /> : <FaRegHeart size={24} />}
          <span
            style={{ cursor: "pointer" }}
            onClick={() => onOpenLikes(post.id)}
          >
            {likeCount ?? 0}
          </span>
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
            onClick={() => onOpenComments(post.id)}
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
          </svg>
          <span>{post.comment_count ?? 0}</span>
        </div>

        <div className="feed-container-3-2-1">
          <FaShare title="Share" size={24} className="icon" />
        </div>

        <div
          className="feed-container-3-2-1"
          onClick={() => onToggleSave(post.id)}
          style={{ cursor: "pointer" }}
        >
          {saved ? (
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
  );
}
