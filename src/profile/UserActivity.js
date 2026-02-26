import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ua.css";
import { MdDeleteOutline } from "react-icons/md";
import SinglePostModal from "./SinglePostModal";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const UserActivity = ({ userId }) => {
  const server = process.env.REACT_APP_SERVER;
  const loggedinuser = JSON.parse(localStorage.getItem("user"))?.id;
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const [activePostId, setActivePostId] = useState(null);
  const [activityTab, setActivityTab] = useState("posts");

  /* ===========================
     FETCH WITH INFINITE QUERY
     =========================== */

  const fetchUserPosts = async ({ pageParam = 0 }) => {
    const limit = pageParam === 0 ? 3 : 6;

    const res = await axios.get(
      `${server}/api/user/activity?userId=${userId}&limit=${limit}&offset=${pageParam}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      posts: res.data,
      nextOffset:
        res.data.length === 0 ? undefined : pageParam + limit,
    };
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["userActivity", userId],
    queryFn: fetchUserPosts,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });

  /* ===========================
     DELETE MUTATION
     =========================== */

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      await axios.delete(`${server}/api/user/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.setQueryData(["userActivity", userId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p.id !== postId),
          })),
        };
      });

      toast.success("Post deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  /* ===========================
     LOADING STATE (SAME UI)
     =========================== */

  if (isLoading)
    return (
      <div
        className="prof-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
        }}
      >
        <div className="load-4" style={{ width: "230px", height: "300px" }} />
        <div className="load-4" style={{ width: "230px", height: "300px" }} />
        <div className="load-4" style={{ width: "230px", height: "300px" }} />
      </div>
    );

  const allPosts =
    data?.pages.flatMap((page) => page.posts) || [];

  if (allPosts.length === 0) {
    return (
      <div>
        <p className="no-activity">No activity here</p>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  const filteredPosts = allPosts.filter((post) => {
    if (activityTab === "posts")
      return post.post_type !== "discussion";
    if (activityTab === "discussion")
      return post.post_type === "discussion";
    return true;
  });

  /* ===========================
     RENDER (UNCHANGED UI)
     =========================== */

  return (
    <div className="activity-container">
      {activePostId && (
        <SinglePostModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
        />
      )}

      <div className="switch-container">
        <button
          onClick={() => setActivityTab("posts")}
          className={`switch-btn ${
            activityTab === "posts" ? "active" : ""
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActivityTab("discussion")}
          className={`switch-btn ${
            activityTab === "discussion" ? "active" : ""
          }`}
        >
          Discussion
        </button>
      </div>

      <div className="posts-grid">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">
            {activityTab === "posts"
              ? "No posts yet."
              : "No discussions yet."}
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              {post.image_url ? (
                <>
                  <img
                    src={post.image_url}
                    className="post-image"
                    onClick={() => setActivePostId(post.id)}
                  />

                  {userId == loggedinuser && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteMutation.mutate(post.id)
                      }
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  )}
                </>
              ) : (
                <div
                  className="feed-container"
                  style={{ padding: "20px" }}
                >
                  <b>
                    {post.first_name}
                    {post.last_name}
                  </b>

                  {userId == loggedinuser && (
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteMutation.mutate(post.id)
                      }
                    >
                      <MdDeleteOutline size={20} />
                    </button>
                  )}

                  <div className="user-activity-caption">
                    {post.caption}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="show-more-container">
          <button
            onClick={() => fetchNextPage()}
            className="show-more-btn"
          >
            Show more
          </button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default UserActivity;