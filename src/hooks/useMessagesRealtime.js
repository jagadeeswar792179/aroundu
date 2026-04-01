import { useEffect } from "react";
import { getSocket } from "../socket";
import { useQueryClient } from "@tanstack/react-query";

export default function useMessagesRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg) => {
      // 🔥 update conversations (badge)
      queryClient.setQueryData(["conversations"], (old = []) => {
        const idx = old.findIndex(
          (c) => c.conversation_id === msg.conversation_id,
        );

        if (idx === -1) return old;

        const convo = old[idx];

        const updated = {
          ...convo,
          last_message: msg.body,
          unread_count: (convo.unread_count || 0) + 1,
        };

        return [updated, ...old.filter((_, i) => i !== idx)];
      });

      // 🔥 optional: keep messages synced
      queryClient.invalidateQueries(["messages", msg.conversation_id]);
    };

    socket.on("message:new", handler);

    return () => socket.off("message:new", handler);
  }, [queryClient]);
}
