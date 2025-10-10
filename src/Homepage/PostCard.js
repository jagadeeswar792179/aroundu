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
  return (
    <div
      className="feed-container"
      key={post.id}
      style={{ border: "1px solid black", boxSizing: "border-box" }}
    >
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

      <div className="feed-container-2">
        <img src={post.image_url} alt="post" className="feed-image-1" />
      </div>

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
          <FaRegCommentDots
            title="Comments"
            size={24}
            onClick={() => onOpenComments(post.id)}
          />
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
          <FaBookmark size={24} color={saved ? "black" : "gray"} />
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
            style={{
              cursor: post.user_id !== loggedInUserId ? "pointer" : "default",
            }}
            onClick={() => {
              if (post.user_id !== loggedInUserId && onNavigateProfile)
                onNavigateProfile(post.user_id);
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
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  marginRight: 8,
                }}
                onClick={() => onTagClick?.(tag)}
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
  );
}
