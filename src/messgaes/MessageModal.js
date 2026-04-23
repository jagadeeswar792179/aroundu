// src/components/MessageModal.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import LoadMess2 from "../Loading/LoadMess2";
import { getSocket, initSocket } from "../socket"; // ✅ added initSocket
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiTrash } from "react-icons/fi";
import { formatTimestamp } from "../utils/formatTimestamp";
const API_BASE = process.env.REACT_APP_SERVER;

export default function MessageModal({
  isOpen,
  onClose,
  peer,
  onConversationCreated,
}) {
  const me = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  const [active, setActive] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const queryClient = useQueryClient();
  const [hoverMsg, setHoverMsg] = useState(null);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [resolved, setResolved] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const authFetch = (url, opts = {}) =>
    fetch(url, {
      ...opts,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });

  const scrollDown = () =>
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );

  useEffect(() => {
    if (me?.id) {
      initSocket(me.id);
    }
  }, [me?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();

    const headerObj = {
      id: peer.id,
      peer_name:
        `${peer.first_name ?? ""} ${peer.last_name ?? ""}`.trim() ||
        peer.email ||
        "Unknown",
      profile: peer.profile || "/avatar.jpg",
      university: peer.university || null,
      conversation_id: null,
    };

    setActive(headerObj);
    setConversationId(null);
    setText("");

    // ✅ FIXED: React Query-based socket update
    const onIncoming = (message) => {
      if (!message) return;

      const cid =
        message.conversation_id ||
        message.conversationId ||
        message.conversation;

      const sender = message.sender_id || message.senderId || message.from;
      if (!cid) return;

      if (conversationId && String(cid) !== String(conversationId)) {
        return; // ignore other chats
      }
      // 🔥 Always update React Query cache
      queryClient.setQueryData(["messages", cid], (old = []) => {
        const exists = old.some((m) => m.id === message.id);
        if (exists) return old;
        return [...old, message];
      });

      scrollDown();

      // 🔥 If no conversation yet → initialize it
      if (
        !resolved &&
        (String(sender) === String(peer.id) ||
          String(message.peer_id) === String(peer.id) ||
          String(message.peerId) === String(peer.id))
      ) {
        if (cid) {
          setConversationId(cid);
          setActive((a) => ({ ...a, conversation_id: cid }));

          if (typeof onConversationCreated === "function") {
            onConversationCreated(cid, peer);
          }
        }
      }
    };

    if (socket) {
      socket.on("message:new", onIncoming);
      socket.on("message", onIncoming);
    }

    // ✅ detect existing conversation (NO loadMessages)
    (async function detectConversation() {
      try {
        const res = await authFetch(`${API_BASE}/api/messages/conversations`);
        if (!res.ok) throw new Error("Failed to fetch conversations");

        const convos = await res.json();
        if (!Array.isArray(convos)) return;

        const found = convos.find((c) => String(c.peer_id) === String(peer.id));

        if (found) {
          const cid =
            found.conversation_id ||
            found.id ||
            found.conversationId ||
            found._id;

          if (cid) {
            setConversationId(cid);
            setActive((a) => ({ ...a, conversation_id: cid }));
            setResolved(true);
            // ❌ DO NOT CALL loadMessages
          }
        }
      } catch (err) {
        console.error("detectConversation error", err);
      }
    })();

    return () => {
      if (socket) {
        socket.off("message:new", onIncoming);
        socket.off("message", onIncoming);
      }
    };
  }, [isOpen, peer?.id]);

  const { data: msgs = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const r = await authFetch(`${API_BASE}/api/messages/${conversationId}`);
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      return data.reverse();
    },
    enabled: !!conversationId,
    staleTime: 0,
  });

  const deleteMessage = async (messageId) => {
    try {
      await authFetch(`${API_BASE}/api/messages/message/${messageId}`, {
        method: "DELETE",
      });

      queryClient.setQueryData(["messages", conversationId], (old = []) =>
        old.map((m) => (m.id === messageId ? { ...m, deleted: true } : m)),
      );
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    authFetch(`${API_BASE}/api/messages/${conversationId}/seen`, {
      method: "POST",
    }).catch(() => {});
  }, [conversationId]);

  const createConversation = async () => {
    const payload = { peerId: peer.id };
    const r = await authFetch(`${API_BASE}/api/messages/conversation`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    const cid =
      data.id || data.conversation_id || data.conversationId || data._id;

    setConversationId(cid);
    setActive((a) => ({ ...a, conversation_id: cid }));

    if (typeof onConversationCreated === "function") {
      onConversationCreated(cid, peer);
    }

    return cid;
  };

  const send = async () => {
    if (!text.trim()) return;

    const bodyText = text.trim();
    setText("");

    let cid = conversationId;

    if (!cid) {
      cid = await createConversation();
    }

    const tempId = `temp-${Date.now()}`;

    const optimisticMsg = {
      id: tempId,
      conversation_id: cid,
      sender_id: me?.id,
      body: bodyText,
      created_at: new Date().toISOString(),
      pending: true,
      sender_profile: me?.profile,
    };

    // 🔥 Optimistic update
    queryClient.setQueryData(["messages", cid], (old = []) => [
      ...old,
      optimisticMsg,
    ]);

    scrollDown();

    try {
      const msg = await authFetch(`${API_BASE}/api/messages/${cid}/send`, {
        method: "POST",
        body: JSON.stringify({ body: bodyText }),
      }).then((r) => r.json());

      queryClient.setQueryData(["messages", cid], (old = []) =>
        old.map((m) => (m.id === tempId ? { ...msg, pending: false } : m)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const profileImage = useCallback((url) => url || "/avatar.jpg", []);
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!isOpen) return null;

  const displayName =
    active?.peer_name ||
    `${peer.first_name || ""} ${peer.last_name || ""}`.trim() ||
    peer.email;

  // ⛔ UI BELOW UNCHANGED
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "500px",
          maxWidth: "100%",
          height: "90vh",
          background: "#fff",
          borderRadius: 30,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* right-side close button */}

        {/* mess-7 block (keeps classnames identical to your original) */}
        <div
          className="mess-77"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div
            className="mess-8"
            style={{ padding: 12, borderBottom: "1px solid #eee" }}
          >
            <div style={{ marginLeft: "auto" }}></div>
            {active && (
              <div className="flex-r jspacebtw">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {active.profile ? (
                    <>
                      <img
                        src={active.profile || "/avatar.jpg"}
                        alt={active.peer_name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                        }}
                      />
                    </>
                  ) : (
                    <div className="avatar-fallback">
                      {(() => {
                        const full = `${displayName || ""}`.trim();
                        const parts = full.split(" ").filter(Boolean);

                        const first = parts[0]?.[0] || "";
                        const second = parts[1]?.[0] || "";

                        return (first + second).toUpperCase();
                      })()}
                    </div>
                  )}
                  <div>
                    <div className="convo-name-active">{displayName}</div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      {active.university || "University info not available"}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                  onClick={() => onClose?.()}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div
            className="mess-9"
            style={{ overflowY: "auto", padding: 12, flex: 1 }}
          >
            {loadingMsgs && <LoadMess2 />}
            {msgs.map((m) => {
              const mine = m.sender_id === me?.id;

              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoverMsg(m.id)}
                  onMouseLeave={() => setHoverMsg(null)}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    margin: "6px 0",
                    gap: 8,
                    opacity: m.pending ? 0.6 : 1,
                  }}
                >
                  {mine && hoverMsg === m.id && !m.deleted && (
                    <FiTrash
                      size={14}
                      style={{ cursor: "pointer", opacity: 0.7 }}
                      onClick={() => deleteMessage(m.id)}
                    />
                  )}

                  {!mine && (
                    <img
                      src={m.sender_profile || active.profile || "/avatar.jpg"}
                      alt="profile"
                      style={{ width: 28, height: 28, borderRadius: "50%" }}
                    />
                  )}

                  <div
                    style={{
                      maxWidth: "70%",
                      background: mine ? "#DCF8C6" : "#f1f1f1",
                      borderRadius: 12,
                      padding: "8px 12px",
                    }}
                  >
                    {m.deleted ? (
                      <i style={{ color: "#777" }}>This message was deleted</i>
                    ) : (
                      <>
                        <div>
                          {m.body}
                          {m.pending && " ⏳"}
                          {m.failed && " ❌"}
                        </div>

                        <div className="timestamp-mess">
                          {formatTimestamp(m.created_at)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* input area (only show when active exists) */}
          {active && (
            <div
              className="mess-10"
              style={{ borderTop: "1px solid #eee", padding: 8 }}
            >
              <div className="input-wrapper">
                <textarea
                  placeholder="Write a message..."
                  value={text}
                  maxLength={1000}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), send())
                  }
                  rows={1}
                  className="message-input"
                />
                <button onClick={send} className="send-btn">
                  <FiSend size={20} />
                </button>
              </div>
              <div
                className="char-count"
                style={{
                  textAlign: "right",
                  color: "#666",
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                {text.length}/1000
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
