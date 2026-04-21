import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../socket";

export default function useMessagesRealtime(activeConversationId, me) {
  const queryClient = useQueryClient();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    // ===============================
    // NEW MESSAGE
    // ===============================
    const onNew = (msg) => {
      // 🔹 Update messages
      queryClient.setQueryData(
        ["messages", msg.conversation_id],
        (old = []) => {
          const exists = old.some((m) => m.id === msg.id);
          if (exists) return old;
          return [...old, msg];
        },
      );

      // 🔹 Update conversations (GLOBAL)
      queryClient.setQueryData(["conversations"], (old = []) => {
        if (!old || old.length === 0) {
          return [
            {
              conversation_id: msg.conversation_id,
              last_message: msg.body,
              unread_count: 1,
            },
          ];
        }

        const exists = old.some(
          (c) => c.conversation_id === msg.conversation_id,
        );

        if (!exists) {
          return [
            {
              conversation_id: msg.conversation_id,
              last_message: msg.body,
              unread_count: 1,
            },
            ...old,
          ];
        }

        return old.map((c) =>
          c.conversation_id === msg.conversation_id
            ? {
                ...c,
                last_message: msg.body,
                unread_count:
                  activeConversationId === msg.conversation_id
                    ? 0
                    : Number(c.unread_count || 0) + 1, // 🔥 FIX
              }
            : c,
        );
      });
    };

    // ===============================
    // SEEN
    // ===============================
    const onSeen = ({ conversation_id }) => {
      queryClient.setQueryData(["messages", conversation_id], (old = []) =>
        old.map((m) => (m.sender_id === me?.id ? { ...m, seen: true } : m)),
      );

      // reset unread count
      queryClient.setQueryData(["conversations"], (old = []) =>
        old.map((c) =>
          c.conversation_id === conversation_id ? { ...c, unread_count: 0 } : c,
        ),
      );
    };

    // ===============================
    // DELETE
    // ===============================
    const onDelete = ({ messageId, conversation_id }) => {
      queryClient.setQueryData(["messages", conversation_id], (old = []) =>
        old.map((m) => (m.id === messageId ? { ...m, deleted: true } : m)),
      );

      queryClient.setQueryData(["conversations"], (old = []) =>
        old.map((c) =>
          c.conversation_id === conversation_id &&
          c.last_message_id === messageId
            ? { ...c, last_message: "Message deleted" }
            : c,
        ),
      );
    };

    // ===============================
    // REGISTER
    // ===============================
    socket.on("message:new", onNew);
    socket.on("message:deleted", onDelete);
    socket.on("message:seen", onSeen); // 🔥 ADD THIS

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:deleted", onDelete);
      socket.off("message:seen", onSeen);
    };
  }, [socket, queryClient, activeConversationId, me]);
}
