import "./messages.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiSend } from "react-icons/fi";
import LoadMessage from "../Loading/LoadMessages";
import LoadMess2 from "../Loading/LoadMess2";
import LostFound from "../LostFound/LostFound";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import BlockConfirmModal from "../utils/BlockConfirmModal";

const API_BASE = process.env.REACT_APP_SERVER;

function Messages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user"));

  const [active, setActive] = useState(null);
  const [text, setText] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockLoading, setBlockLoading] = useState(false);
const [openMenuConvId, setOpenMenuConvId] = useState(null);
  const bottomRef = useRef(null);

  const socket = useMemo(
    () =>
      io(API_BASE, {
        autoConnect: false,
        transports: ["websocket"],
      }),
    []
  );

  const authFetch = (url, opts = {}) =>
    fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });

  const scrollDown = () =>
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

  // ===============================
  // Conversations Query
  // ===============================
  const {
    data: convos = [],
    isLoading: loadingConvos,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await authFetch(`${API_BASE}/api/messages/conversations`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  // ===============================
  // Messages Query (Per Conversation)
  // ===============================
  const {
    data: msgs = [],
    isLoading: loadingMsgs,
  } = useQuery({
    queryKey: ["messages", active?.conversation_id],
    queryFn: async () => {
      if (!active?.conversation_id) return [];
      const r = await authFetch(
        `${API_BASE}/api/messages/${active.conversation_id}`
      );
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      return data.reverse();
    },
    enabled: !!active?.conversation_id,
    staleTime: 1000 * 60 * 5,
  });

  // ===============================
  // Socket Logic
  // ===============================
  useEffect(() => {
    if (!me?.id) return;

    socket.connect();
    socket.emit("join", me.id);

    const onNew = (msg) => {
      // Update messages cache
      queryClient.setQueryData(
        ["messages", msg.conversation_id],
        (old = []) => [...old, msg]
      );

      // Update conversation preview
      queryClient.setQueryData(["conversations"], (old = []) => {
        const idx = old.findIndex(
          (c) => c.conversation_id === msg.conversation_id
        );
        if (idx === -1) return old;

        const convo = old[idx];
        const others = [...old.slice(0, idx), ...old.slice(idx + 1)];
        return [{ ...convo, last_message: msg.body }, ...others];
      });

      scrollDown();
    };

    socket.on("message:new", onNew);

    return () => {
      socket.off("message:new", onNew);
      socket.disconnect();
    };
  }, [me?.id, socket, queryClient]);

  // ===============================
  // Open Conversation
  // ===============================
  const openConversation = (c) => {
    setActive({
      conversation_id: c.conversation_id,
      peer_id: c.peer_id,
      peer_name:
        `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.email,
      profile: c.profile,
      university: c.university,
    });

    if (window.innerWidth <= 700) {
      setMobileOpen(true);
    }
  };

  // ===============================
  // Send Message (Optimistic)
  // ===============================
  const send = async () => {
    if (!text.trim() || !active) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversation_id: active.conversation_id,
      sender_id: me?.id,
      body: text.trim(),
      created_at: new Date().toISOString(),
      pending: true,
      sender_profile: me?.profile,
    };

    // Optimistic update
    queryClient.setQueryData(
      ["messages", active.conversation_id],
      (old = []) => [...old, optimisticMsg]
    );

    queryClient.setQueryData(["conversations"], (old = []) => {
      const idx = old.findIndex(
        (c) => c.conversation_id === active.conversation_id
      );
      if (idx === -1) return old;

      const convo = old[idx];
      const others = [...old.slice(0, idx), ...old.slice(idx + 1)];
      return [{ ...convo, last_message: optimisticMsg.body }, ...others];
    });

    setText("");
    scrollDown();

    try {
      const msg = await authFetch(
        `${API_BASE}/api/messages/${active.conversation_id}/send`,
        { method: "POST", body: JSON.stringify({ body: optimisticMsg.body }) }
      ).then((r) => r.json());

      queryClient.setQueryData(
        ["messages", active.conversation_id],
        (old = []) =>
          old.map((m) =>
            m.id === tempId ? { ...msg, pending: false } : m
          )
      );
    } catch (err) {
      console.error(err);
    }
  };


  const handleConfirmBlock = async () => {
  if (!blockTarget) return;

  setBlockLoading(true);

  try {
    await authFetch(
      `${API_BASE}/api/moderation/block/${blockTarget.peerId}`,
      {
        method: "POST",
        body: JSON.stringify({
          reason: "Blocked from messages",
        }),
      }
    );

    // Remove conversation from React Query cache
    queryClient.setQueryData(["conversations"], (old = []) =>
      old.filter((c) => c.peer_id !== blockTarget.peerId)
    );

    // Close chat if active
    if (active?.peer_id === blockTarget.peerId) {
      setActive(null);
    }

    setShowBlockModal(false);
    setBlockTarget(null);
  } catch (err) {
    console.error("Block failed:", err);
    alert("Blocking failed. Try again.");
  } finally {
    setBlockLoading(false);
  }
};
const openBlockModalFromConvo = (convo, name) => {
  setBlockTarget({ peerId: convo.peer_id, name });
  setShowBlockModal(true);
};
  // ===============================
  // UI
  // ===============================
  return (
    <>
      <BlockConfirmModal
        isOpen={showBlockModal}
        isBlocking={blockLoading}
        targetName={blockTarget?.name}
        onClose={() => {
          if (blockLoading) return;
          setShowBlockModal(false);
          setBlockTarget(null);
        }}
        onConfirm={handleConfirmBlock}
      />

          <div className="mess-0">
            <div className="mess-1">
              <h2>Messaging</h2>
            </div>

            {/* Add mobile-open class when mobileOpen is true */}
            <div className={`mess-2 ${mobileOpen ? "mobile-open" : ""}`}>
              <div className="mess-3 left-panel">
                <div className="mess-3-1">
                  {loadingConvos ? (
                    <LoadMessage />
                  ) : convos.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#666",
                      }}
                    >
                      No conversations found
                    </div>
                  ) : (
                    convos.map((c) => {
                      const name =
                        `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() ||
                        c.email;
                      const isActive =
                        active?.conversation_id === c.conversation_id;
                      return (
                        <div
                          className={`mess-4 conversation-item ${
                            isActive ? "active" : ""
                          }`}
                          key={c.conversation_id}
                          onClick={() =>
                            openConversation(
                             c
                            )
                          }
                        >
                          {c.profile ? (
                            <img
                              src={c.profile || "/avatar.jpg"}
                              alt={name}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <div className="avatar-fallback">
                              {`${c.first_name?.[0] || ""}${
                                c.last_name?.[0] || ""
                              }`.toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div className="mess-head">{name}</div>
                              {c.unread_count > 0 && (
                                <span className="pill">{c.unread_count}</span>
                              )}
                            </div>
                            <div
                              className="conversation-text"
                              title={c.last_message || ""}
                            >
                              {c.last_message || "Say hello"}
                            </div>
                          </div>
                          <div className="kebab-wrapper">
                            <div
                              className="kebab-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuConvId(
                                  openMenuConvId === c.conversation_id
                                    ? null
                                    : c.conversation_id
                                );
                              }}
                            >
                              ⋮
                            </div>

                            {openMenuConvId === c.conversation_id && (
                              <div className="kebab-menu">
                                <div
                                  className="kebab-item danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuConvId(null);
                                    openBlockModalFromConvo(c, name);
                                  }}
                                >
                                  Block this person
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT: active conversation */}
              <div className="mess-7">
                {!active ? (
                  <div className="empty-state">
                    <div>Select a chat</div>
                    <div className="subtitle">
                      Pick a conversation from the left
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mess-8">
                      {active && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            {active.profile ? (
                              <img
                                src={active.profile || "/avatar.jpg"}
                                alt={active.peer_name}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div className="avatar-fallback">
                                {(() => {
                                  const full = `${
                                    active?.peer_name || ""
                                  }`.trim();
                                  const parts = full.split(" ").filter(Boolean);

                                  const first = parts[0]?.[0] || "";
                                  const second = parts[1]?.[0] || "";

                                  return (first + second).toUpperCase();
                                })()}
                              </div>
                            )}
                            <div>
                              <div
                                className="convo-name-active"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  navigate(`/profile/${active.peer_id}`);
                                }}
                              >
                                {active.peer_name}
                              </div>
                              {/* <div style={{ fontSize: "13px", color: "#666" }}>
                                {active.university ||
                                  "University info not available"}
                              </div> */}
                            </div>
                          </div>

                          {/* mobile back button */}
                          <button
                            className="mobile-back-btn"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Back"
                          >
                            {`< Back`}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mess-9" style={{ overflowY: "auto" }}>
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
                                src={m.sender_profile || "/avatar.jpg"}
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
                                padding: "8px 12px",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                border: m.failed ? "1px solid red" : "none",
                                borderRadius: "20px",
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

                    {/* Only show input box if chat is active */}
                    {active && (
                      <div className="mess-10">
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
                        <div className="char-count">{text.length}/1000</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hider-small">
            <LostFound />
          </div>
       
    </>
  );
}

export default Messages;