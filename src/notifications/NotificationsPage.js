import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../socket";
import { useNavigate } from "react-router-dom";
import LostFound from "../LostFound/LostFound";
import "./notification.css";
import SinglePostModal from "../profile/SinglePostModal";
import { formatTimestamp } from "../utils/formatTimestamp";
const API_BASE = process.env.REACT_APP_SERVER;

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const socket = getSocket();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activePostId, setActivePostId] = useState(null);

  // ✅ fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    refetchOnWindowFocus: true,
  });

  // ✅ unread count
  const { data: unreadData } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
  });

  const unread = unreadData?.count || 0;

  // ✅ mark all as read
  const markAllRead = async () => {
    await fetch(`${API_BASE}/api/notifications/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    queryClient.setQueryData(["notifications-unread"], { count: 0 });
  };

  // ✅ sort newest first
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {activePostId && (
        <SinglePostModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
        />
      )}
      <div className="notificationpage">
        <div className="flex-r jspacebtw">
          <h2>Notifications ({unread})</h2>

          <button onClick={markAllRead} className="form-button">
            Mark all as read
          </button>
        </div>

        {sorted.length === 0 && <p>No notifications yet</p>}

        {sorted.map((n) => (
          <div
            key={n.id}
            style={{
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
            className="notification-item"
            onClick={() => setActivePostId(n.data.postId)}
            // onClick={() => {

            //   // 🔥 navigate to post (future-ready)
            //   if (n.data?.postId) {
            //     navigate(`/post/${n.data.postId}`);
            //   }
            // }}
          >
            <b>{n.data?.actorName}</b> {n.data?.message}
            <div
              style={{
                fontSize: "12px",
                color: "#888",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {formatTimestamp(n.created_at)}
              {/* {new Date(n.created_at).toLocaleString()} */}
            </div>
          </div>
        ))}
      </div>
      <div className="hider-small">
        <LostFound />
      </div>
    </>
  );
}
