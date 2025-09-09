// src/components/Notifications.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io as ioClient } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

/**
 * Notifications component
 *
 * - Fetches from GET /api/notifications?page=1&pageSize=20
 * - POST /api/notifications/:id/mark-read  (marks single)
 * - POST /api/notifications/mark-all-read  (marks all)
 *
 * Behavior:
 * - Keeps notifications in state (never removes them unless user navigates away)
 * - Optimistic UI for mark-read / mark-all-read (reverts if API fails)
 * - Realtime socket 'notification' events prepend to list (deduped)
 * - Pagination via "Load more"
 */

export default function Notifications({
  socketUrl = "https://aroundubackend.onrender.com",
  pageSize = 20,
}) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]); // newest-first
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef(null);
  const mountedRef = useRef(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = loggedInUser?.id;
  const token = localStorage.getItem("token");

  // helper axios instance (relative base)
  const api = axios.create({
    baseURL: "",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 10000,
  });

  // fetch page (1-based). if replace=true it replaces list, else appends (for load more)
  const fetchPage = async (p = 1, replace = false) => {
    if (!token) return;
    if (p === 1) setLoading(true);
    else setFetchingMore(true);
    try {
      const res = await api.get("/api/notifications", {
        params: { page: p, pageSize },
      });
      const list = Array.isArray(res.data.notifications)
        ? res.data.notifications
        : [];

      // server returns newest-first order
      if (replace) {
        setNotifications(list);
      } else {
        setNotifications((prev) => {
          // append but ensure dedupe by id (keep newest-first overall)
          const ids = new Set(prev.map((x) => x.id));
          const unique = list.filter((x) => !ids.has(x.id));
          return [...prev, ...unique];
        });
      }

      // unread count
      const totalUnread = (replace ? list : [...notifications, ...list]).filter(
        (n) => !n.read
      ).length;
      setUnreadCount(totalUnread);

      // server can signal hasMore; fallback to page-size logic
      const got = list.length;
      if (got < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error(
        "Failed to load notifications",
        err?.response?.data || err?.message || err
      );
    } finally {
      if (p === 1) setLoading(false);
      else setFetchingMore(false);
    }
  };

  // Initial load (once)
  useEffect(() => {
    if (!mountedRef.current) {
      fetchPage(1, true);
      mountedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket connection + join room + listen to notifications
  useEffect(() => {
    if (!loggedInUserId || !token) return;
    const socket = ioClient(socketUrl, {
      auth: token ? { token } : undefined,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      try {
        socket.emit("join", loggedInUserId);
      } catch (err) {
        console.warn("socket join error", err);
      }
    });

    socket.on("notification", (notif) => {
      if (!notif || !notif.id) return;
      setNotifications((prev) => {
        if (prev.some((p) => p.id === notif.id)) {
          // if existing, update it (e.g., read flag changed)
          return prev.map((p) => (p.id === notif.id ? { ...p, ...notif } : p));
        }
        return [notif, ...prev];
      });
      setUnreadCount((c) => c + (notif.read ? 0 : 1));
    });

    // keep compatibility with legacy follow events (server also creates notifications rows)
    socket.on("follow_request_received", () => {});
    socket.on("follow_request_accepted", () => {});

    return () => {
      socket.off("notification");
      socket.off("follow_request_received");
      socket.off("follow_request_accepted");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loggedInUserId, token, socketUrl]);

  // optimistic mark single read
  const markRead = async (nid) => {
    if (!nid) return;
    // if already read, no-op
    const target = notifications.find((n) => n.id === nid);
    if (!target || target.read) return;

    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === nid ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await api.post(`/api/notifications/${nid}/mark-read`);
      // success -> nothing more to do
    } catch (err) {
      console.error(
        "markRead failed",
        err?.response?.data || err?.message || err
      );
      // rollback on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === nid ? { ...n, read: false } : n))
      );
      setUnreadCount((c) => c + 1);
    }
  };

  // optimistic mark all read
  const markAllRead = async () => {
    const anyUnread = notifications.some((n) => !n.read);
    if (!anyUnread) return;

    // snapshot for rollback
    const prevSnapshot = notifications.map((n) => ({ id: n.id, read: n.read }));

    // optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.post(`/api/notifications/mark-all-read`);
    } catch (err) {
      console.error(
        "markAllRead failed",
        err?.response?.data || err?.message || err
      );
      // rollback to previous read flags
      setNotifications((prev) =>
        prev.map((n) => {
          const snap = prevSnapshot.find((s) => s.id === n.id);
          return snap ? { ...n, read: snap.read } : n;
        })
      );
      setUnreadCount(prevSnapshot.filter((s) => !s.read).length);
    }
  };

  // Load more (pagination)
  const loadMore = async () => {
    if (!hasMore || fetchingMore) return;
    const next = page + 1;
    setPage(next);
    await fetchPage(next, false);
  };

  // when opening dropdown, refresh to show latest (optional)
  const handleToggleOpen = async () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) {
      // refresh first page for latest
      setPage(1);
      await fetchPage(1, true);
    }
  };

  // click behavior (routing)
  const handleNotificationClick = async (n) => {
    if (!n) return;
    if (!n.read) markRead(n.id);

    const typ = n.entity_type;
    const ent = n.entity_id;
    const data = n.data || {};

    try {
      if (typ === "post" && ent) {
        navigate(`/post/${ent}`);
      } else if (typ === "comment" && data.postId) {
        navigate(`/post/${data.postId}#comment-${ent || data.commentId}`);
      } else if (typ === "user" && ent) {
        navigate(`/profile/${ent}`);
      } else if (n.type === "follow_request" && n.actor_id) {
        navigate(`/profile/${n.actor_id}`);
      } else {
        navigate("/notifications");
      }
    } catch (err) {
      console.warn("navigation failed", err);
    } finally {
      setOpen(false);
    }
  };

  // small renderer
  const renderMessage = (n) => {
    const actorName = (n.data && n.data.actor_name) || n.actor_id || "Someone";
    switch (n.type) {
      case "like":
        return `${actorName} liked your post.`;
      case "comment":
        return `${actorName} commented: "${
          n.data && n.data.commentText
            ? String(n.data.commentText).slice(0, 80)
            : ""
        }"`;
      case "comment_mention":
        return `${actorName} replied on a post you commented on.`;
      case "follow_request":
        return `${actorName} sent you a follow request.`;
      case "follow_accept":
        return `${actorName} accepted your follow request.`;
      case "profile_view":
        return `${actorName} viewed your profile.`;
      case "unfollow":
        return `${actorName} unfollowed you.`;
      default:
        return (n.data && n.data.message) || `${actorName} did something.`;
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={handleToggleOpen}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        aria-label="Notifications"
      >
        <FaBell size={20} />
        <span style={{ fontSize: 13 }}>Notifications</span>
        {unreadCount > 0 && (
          <span
            style={{
              marginLeft: 6,
              background: "#d32f2f",
              color: "#fff",
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 12,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            width: 380,
            maxHeight: 520,
            overflow: "auto",
            background: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            borderRadius: 8,
            zIndex: 2000,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
            }}
          >
            <strong>Notifications</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setPage(1);
                  fetchPage(1, true);
                }}
                style={{ fontSize: 12, padding: "6px 8px" }}
              >
                Refresh
              </button>
              <button
                onClick={markAllRead}
                style={{ fontSize: 12, padding: "6px 8px" }}
              >
                Mark all read
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee" }}>
            {loading && (
              <div style={{ padding: 12, color: "#666" }}>Loading…</div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: 12, color: "#666" }}>No notifications</div>
            )}

            {!loading &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: 10,
                    borderBottom: "1px solid #f1f1f1",
                    background: n.read ? "#fff" : "#f7fbff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#eee",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={(n.data && n.data.actor_avatar_url) || "/avatar.jpg"}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/avatar.jpg";
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {renderMessage(n)}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>

                    {n.data && n.data.excerpt && (
                      <div
                        style={{ marginTop: 6, color: "#555", fontSize: 13 }}
                      >
                        {String(n.data.excerpt).slice(0, 140)}
                      </div>
                    )}

                    {!n.read && (
                      <div style={{ marginTop: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                          style={{ padding: "6px 10px", fontSize: 13 }}
                        >
                          Mark read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div style={{ padding: 10, textAlign: "center" }}>
            {hasMore ? (
              <button
                onClick={loadMore}
                disabled={fetchingMore}
                style={{ padding: "8px 14px" }}
              >
                {fetchingMore ? "Loading..." : "Load more"}
              </button>
            ) : (
              notifications.length > 0 && (
                <div style={{ color: "#777" }}>No more notifications</div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
