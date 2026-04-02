import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSocket } from "../socket";

const API_BASE = process.env.REACT_APP_SERVER;

export default function useNotifications() {
  const queryClient = useQueryClient();
  const socket = getSocket();
  const token = localStorage.getItem("token");

  // ✅ fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
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

  // 🔥 REALTIME UPDATE
  useEffect(() => {
    if (!socket) return;

    const handler = (notif) => {
      console.log("REALTIME NOTIF:", notif);

      queryClient.setQueryData(["notifications"], (old = []) => {
        const exists = old.some((n) => n.id === notif.id);

        // ✅ only add if new
        if (!exists) {
          // ✅ increment unread ONLY if new
          queryClient.setQueryData(["notifications-unread"], (oldUnread) => ({
            count: (oldUnread?.count || 0) + 1,
          }));

          return [notif, ...old];
        }

        return old;
      });
    };

    socket.on("notification:new", handler);

    return () => socket.off("notification:new", handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const deleteHandler = (data) => {
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.filter((n) => {
          // 🔥 HANDLE POST DELETE
          if (data.type === "post") {
            return !(
              n.entity_id === data.postId || n.data?.postId === data.postId
            );
          }

          // existing logic
          if (data.type === "like") {
            return !(
              n.entity_id === data.entityId && n.actor_id === data.actorId
            );
          }

          if (data.type === "comment") {
            return n.entity_id !== data.entityId;
          }

          return true;
        }),
      );

      // ✅ always correct
      queryClient.invalidateQueries(["notifications-unread"]);
    };

    socket.on("notification:delete", deleteHandler);

    return () => socket.off("notification:delete", deleteHandler);
  }, [socket]);
  return { notifications, unread };
}
