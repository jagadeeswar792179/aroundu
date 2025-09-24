// src/components/MessageModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import io from "socket.io-client";
import LoadMess2 from "../Loading/LoadMess2";
/**
 * MessageModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - peer: { id, first_name, last_name, profile, university, email }
 *  - onConversationCreated?: function(conversationId, peer)  // optional callback for parent refresh
 *
 * Notes:
 *  - Requires `token` in localStorage and `user` object in localStorage (same as your app).
 *  - Uses endpoints:
 *      GET /api/messages/conversations
 *      POST /api/messages/conversation  { peerId }
 *      GET /api/messages/:conversationId
 *      POST /api/messages/:conversationId/send   { body }
 *      POST /api/messages/:conversationId/seen
 *
 *  - Adjust API_BASE if your server runs elsewhere.
 */
const API_BASE = process.env.REACT_APP_SERVER;
let socket = null;

export default function MessageModal({
  isOpen,
  onClose,
  peer,
  onConversationCreated,
}) {
  const me = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  // mirrors 'active' in your messages.js — contains header info + conversation metadata
  const [active, setActive] = useState(null);

  // conversation id (if exists). null means none yet.
  const [conversationId, setConversationId] = useState(null);

  // messages list
  const [msgs, setMsgs] = useState([]);

  // loading flags
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  // compose text
  const [text, setText] = useState("");

  // for debounced scroll or socket connect indicator
  const [socketConnected, setSocketConnected] = useState(false);

  // helper fetch with auth
  const authFetch = (url, opts = {}) =>
    fetch(url, {
      ...opts,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": opts.body ? "application/json" : "application/json",
        ...(opts.headers || {}),
      },
    });

  // scroll to bottom helper
  const scrollDown = () =>
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

  // Initialize active and detect existing conversation on open
  useEffect(() => {
    if (!isOpen) return;

    // set header immediately
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
    setMsgs([]);
    setConversationId(null);
    setText("");

    // ensure socket connected
    if (!socket) {
      socket = io(API_BASE, {
        transports: ["websocket", "polling"],
        auth: { token },
      });

      socket.on("connect", () => {
        setSocketConnected(true);
        // optionally emit auth if your server expects it:
        // socket.emit('authenticate', { token });
      });

      socket.on("disconnect", () => setSocketConnected(false));
    } else if (!socket.connected) {
      socket.connect();
    }

    // Listen for incoming messages (global)
    const onIncoming = (message) => {
      // message expected shape: { conversation_id, sender_id, body, created_at, ... }
      // Only add if belongs to our active conversation or if it's a new conversation with this peer.
      if (!message) return;
      const cid =
        message.conversation_id ||
        message.conversationId ||
        message.conversation;
      const sender = message.sender_id || message.senderId || message.from;

      // if we already have a conversation id and it matches, append
      if (conversationId && cid && String(cid) === String(conversationId)) {
        setMsgs((prev) => [...prev, message]);
        scrollDown();
      } else {
        // if no conversation yet but incoming message is from this peer (maybe they started it),
        // then set conversationId and load messages.
        if (
          !conversationId &&
          (sender === peer.id ||
            message.peer_id === peer.id ||
            message.peerId === peer.id)
        ) {
          const newCid = cid;
          if (newCid) {
            setConversationId(newCid);
            setActive((a) => ({ ...a, conversation_id: newCid }));
            loadMessages(newCid);
            if (typeof onConversationCreated === "function") {
              onConversationCreated(newCid, peer);
            }
          }
        }
      }
    };

    socket.on("message:new", onIncoming);
    socket.on("message", onIncoming); // support other event names

    // detect existing conversation by fetching conversations list
    (async function detectConversation() {
      try {
        const res = await authFetch(`${API_BASE}/api/messages/conversations`);
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const convos = await res.json();
        if (!Array.isArray(convos)) return;

        // your conversations may have different keys; check multiple possibilities
        const found = convos.find((c) => {
          return (
            c.peer_id === peer.id ||
            c.peerId === peer.id ||
            c.user_id === peer.id ||
            c.participants?.includes?.(peer.id)
          );
        });

        if (found) {
          const cid =
            found.conversation_id ||
            found.id ||
            found.conversationId ||
            found._id;
          if (cid) {
            setConversationId(cid);
            setActive((a) => ({ ...a, conversation_id: cid }));
            await loadMessages(cid);
          }
        } else {
          // no conversation yet — do nothing until send or incoming
        }
      } catch (err) {
        console.error("detectConversation error", err);
      }
    })();

    // cleanup handlers when modal closes
    return () => {
      socket.off("message:new", onIncoming);
      socket.off("message", onIncoming);
      // don't disconnect socket here globally (other parts might use it). If you want, you can disconnect.
      // socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, peer?.id]);

  // Load messages for a conversation id
  const loadMessages = async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const r = await authFetch(`${API_BASE}/api/messages/${convId}`);
      if (!r.ok) throw new Error("Failed to load messages");
      const data = await r.json();
      // backend might return newest-first, so reverse to chronological
      const ordered = Array.isArray(data) ? data.slice().reverse() : [];
      setMsgs(ordered);
      scrollDown();

      // mark seen
      authFetch(`${API_BASE}/api/messages/${convId}/seen`, {
        method: "POST",
      }).catch(() => {});
    } catch (err) {
      console.error("loadMessages error", err);
      setMsgs([{ id: "err", body: "Failed to load messages", failed: true }]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Create a conversation (only when sending first message)
  const createConversation = async () => {
    const payload = { peerId: peer.id };
    const r = await authFetch(`${API_BASE}/api/messages/conversation`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(txt || "Failed to create conversation");
    }
    const data = await r.json();
    const cid =
      data.id || data.conversation_id || data.conversationId || data._id;
    if (!cid) throw new Error("Conversation ID missing from create response");
    setConversationId(cid);
    setActive((a) => ({ ...a, conversation_id: cid }));
    // inform parent (messages list) to refresh if provided
    if (typeof onConversationCreated === "function")
      onConversationCreated(cid, peer);
    return cid;
  };

  // Send message (optimistic). If no conversation, create it first, then send.
  const send = async () => {
    if (!text.trim()) return;
    const bodyText = text.trim();
    setText("");

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversation_id: conversationId || null,
      sender_id: me?.id,
      body: bodyText,
      created_at: new Date().toISOString(),
      pending: true,
      sender_profile: me?.profile || null,
    };

    setMsgs((prev) => [...prev, optimistic]);
    scrollDown();

    try {
      setSending(true);
      let cid = conversationId;
      if (!cid) {
        cid = await createConversation();
      }

      // send to server
      const r = await authFetch(`${API_BASE}/api/messages/${cid}/send`, {
        method: "POST",
        body: JSON.stringify({ body: bodyText }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(txt || "Send failed");
      }
      const serverMsg = await r.json();
      // replace optimistic message
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...serverMsg, pending: false } : m
        )
      );
      scrollDown();

      // emit socket event if needed (server should broadcast; but emit for immediate if required)
      if (socket && socket.connected) {
        socket.emit("message:sent", { conversation_id: cid, body: serverMsg });
      }
    } catch (err) {
      console.error("send error", err);
      // mark optimistic as failed
      setMsgs((prev) =>
        prev.map((m) =>
          m.id?.toString().startsWith("temp-")
            ? { ...m, pending: false, failed: true }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!isOpen) return null;

  // displayName for header
  const displayName =
    active?.peer_name ||
    `${peer.first_name || ""} ${peer.last_name || ""}`.trim() ||
    peer.email;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1200,
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
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* right-side close button */}

        {/* mess-7 block (keeps classnames identical to your original) */}
        <div
          className="mess-7"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div
            className="mess-8"
            style={{ padding: 12, borderBottom: "1px solid #eee" }}
          >
            <div style={{ marginLeft: "auto" }}>
              {/* <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                }}
                onClick={() => onClose?.()}
              >
                ✕
              </button> */}
            </div>
            {active && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <img
                  src={active.profile || "/avatar.jpg"}
                  alt={active.peer_name}
                  style={{ width: 40, height: 40, borderRadius: "50%" }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "16px" }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {active.university || "University info not available"}
                  </div>
                </div>
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
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    margin: "6px 0",
                    gap: 8,
                    opacity: m.pending ? 0.6 : 1,
                  }}
                >
                  {!mine && (
                    <img
                      src={m.sender_profile || active.profile || "/avatar.jpg"}
                      alt="profile"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <div
                    style={{
                      maxWidth: "70%",
                      background: mine ? "#DCF8C6" : "#f1f1f1",
                      borderRadius: 12,
                      padding: "8px 12px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      border: m.failed ? "1px solid red" : "none",
                    }}
                  >
                    {m.body}
                    {m.pending && " ⏳"}
                    {m.failed && " ❌"}
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
