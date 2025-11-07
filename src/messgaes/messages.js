// import "./messages.css";
// import Line from "../utils/line";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { FiSend } from "react-icons/fi";
// import LoadMessage from "../Loading/LoadMessages";
// import { FaBookmark, FaChevronDown } from "react-icons/fa";
// import LoadMess2 from "../Loading/LoadMess2";
// import Navbar from "../Homepage/Navbar";

// const API_BASE = process.env.REACT_APP_SERVER;
// function Messages() {
//   const token = localStorage.getItem("token");
//   const me = JSON.parse(localStorage.getItem("user"));

//   const [convos, setConvos] = useState([]);
//   const [active, setActive] = useState(null);
//   const [msgsCache, setMsgsCache] = useState({});
//   const [msgs, setMsgs] = useState([]);
//   const [text, setText] = useState("");
//   const [users, setUsers] = useState([]);
//   const [loadingMsgs, setLoadingMsgs] = useState(false);
//   const [loadingConvos, setLoadingConvos] = useState(true);
//   const newsArray = [
//     "India, Canada reset diplomatic ties; 10m ago",
//     "More Indians invest in mutual funds; 10m ago",
//     "Big Four goes big on hiring; 5h ago • 4,851 readers",
//     "More recruiters get AI savvy; 5h ago • 3,599 readers",
//     "What's shaping IT deals; 5h ago • 3,294 readers",
//     "India, Canada reset diplomatic ties; 10m ago",
//     "More Indians invest in mutual funds; 10m ago",
//     "Big Four goes big on hiring; 5h ago • 4,851 readers",
//     "More recruiters get AI savvy; 5h ago • 3,599 readers",
//     "What's shaping IT deals; 5h ago • 3,294 readers",
//     "India, Canada reset diplomatic ties; 10m ago",
//     "More Indians invest in mutual funds; 10m ago",
//     "Big Four goes big on hiring; 5h ago • 4,851 readers",
//   ];
//   const bottomRef = useRef(null);

//   const socket = useMemo(
//     () =>
//       io(API_BASE, {
//         autoConnect: false,
//         transports: ["websocket"],
//       }),
//     []
//   );

//   const authFetch = (url, opts = {}) =>
//     fetch(url, {
//       ...opts,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//         ...(opts.headers || {}),
//       },
//     });

//   const scrollDown = () =>
//     setTimeout(
//       () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//       0
//     );

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const res = await fetch(`${API_BASE}/api/test-users/all`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setUsers(data);
//     };
//     fetchUsers();
//   }, [token]);

//   useEffect(() => {
//     if (!token) return;
//     setLoadingConvos(true);
//     authFetch(`${API_BASE}/api/messages/conversations`)
//       .then((r) => r.json())
//       .then((data) => setConvos(data))
//       .catch(console.error)
//       .finally(() => setLoadingConvos(false)); // ✅ stop loader
//   }, [token]);

//   useEffect(() => {
//     if (!me?.id) return;
//     socket.connect();
//     socket.emit("join", me.id);

//     const onNew = (msg) => {
//       // If active convo, append to UI
//       if (msg.conversation_id === active?.conversation_id) {
//         setMsgs((prev) => [...prev, msg]);
//       }

//       // Update cache
//       setMsgsCache((prev) => ({
//         ...prev,
//         [msg.conversation_id]: [...(prev[msg.conversation_id] || []), msg],
//       }));

//       // Reorder conversations instantly
//       setConvos((prev) => {
//         const idx = prev.findIndex(
//           (c) => c.conversation_id === msg.conversation_id
//         );
//         if (idx === -1) return prev; // not found
//         const convo = prev[idx];
//         const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
//         return [convo, ...others];
//       });

//       scrollDown();
//     };

//     socket.on("message:new", onNew);
//     return () => {
//       socket.off("message:new", onNew);
//       socket.disconnect();
//     };
//   }, [me?.id, active?.conversation_id, socket]);

//   const openConversation = async (
//     conversation_id,
//     peer_id,
//     peer_name,
//     profile,
//     university
//   ) => {
//     setActive({
//       conversation_id,
//       peer_id,
//       peer_name,
//       profile,
//       university,
//     });
//     if (msgsCache[conversation_id]) {
//       setMsgs(msgsCache[conversation_id]);
//       return;
//     }

//     setMsgs([]);
//     setLoadingMsgs(true);
//     try {
//       const r = await authFetch(`${API_BASE}/api/messages/${conversation_id}`);
//       const data = await r.json();
//       setMsgs([...data].reverse());
//       setMsgsCache((prev) => ({
//         ...prev,
//         [conversation_id]: [...data].reverse(),
//       }));
//     } catch (err) {
//       console.error(err);
//       setMsgs([{ id: "err", body: "Failed to load messages", failed: true }]);
//     } finally {
//       setLoadingMsgs(false);
//       scrollDown();
//     }

//     authFetch(`${API_BASE}/api/messages/${conversation_id}/seen`, {
//       method: "POST",
//     }).catch(() => {});
//   };

//   const startChatWith = async (user) => {
//     const convo = await authFetch(`${API_BASE}/api/messages/conversation`, {
//       method: "POST",
//       body: JSON.stringify({ peerId: user.id }),
//     }).then((r) => r.json());

//     const peerName =
//       `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
//     await openConversation(
//       convo.id,
//       user.id,
//       peerName,
//       user.profile,
//       user.university
//     );

//     authFetch(`${API_BASE}/api/messages/conversations`)
//       .then((r) => r.json())
//       .then((data) => setConvos(data))
//       .catch(() => {});
//   };

//   const send = async () => {
//     if (!text.trim() || !active) return;

//     const tempId = `temp-${Date.now()}`;
//     const optimisticMsg = {
//       id: tempId,
//       conversation_id: active.conversation_id,
//       sender_id: me?.id,
//       body: text.trim(),
//       created_at: new Date().toISOString(),
//       pending: true,
//       sender_profile: me?.profile, // if available
//     };

//     setMsgs((prev) => [...prev, optimisticMsg]);
//     setMsgsCache((prev) => ({
//       ...prev,
//       [active.conversation_id]: [
//         ...(prev[active.conversation_id] || []),
//         optimisticMsg,
//       ],
//     }));
//     setConvos((prev) => {
//       const idx = prev.findIndex(
//         (c) => c.conversation_id === active.conversation_id
//       );
//       if (idx === -1) return prev;
//       const convo = {
//         ...prev[idx],
//         last_message: optimisticMsg.body, // update preview
//       };
//       const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
//       return [convo, ...others]; // move to top
//     });
//     setText("");
//     scrollDown();

//     try {
//       const msg = await authFetch(
//         `${API_BASE}/api/messages/${active.conversation_id}/send`,
//         { method: "POST", body: JSON.stringify({ body: optimisticMsg.body }) }
//       ).then((r) => r.json());

//       setMsgs((prev) =>
//         prev.map((m) => (m.id === tempId ? { ...msg, pending: false } : m))
//       );
//       setMsgsCache((prev) => ({
//         ...prev,
//         [active.conversation_id]: prev[active.conversation_id].map((m) =>
//           m.id === tempId ? { ...msg, pending: false } : m
//         ),
//       }));
//       // Move active convo to top after sending
//       setConvos((prev) => {
//         const idx = prev.findIndex(
//           (c) => c.conversation_id === active.conversation_id
//         );
//         if (idx === -1) return prev;
//         const convo = {
//           ...prev[idx],
//           last_message: msg.body, // overwrite with server-confirmed body
//         };
//         const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
//         return [convo, ...others];
//       });
//     } catch (err) {
//       console.error(err);
//       setMsgs((prev) =>
//         prev.map((m) =>
//           m.id === tempId ? { ...m, pending: false, failed: true } : m
//         )
//       );
//       setMsgsCache((prev) => ({
//         ...prev,
//         [active.conversation_id]: prev[active.conversation_id].map((m) =>
//           m.id === tempId ? { ...m, pending: false, failed: true } : m
//         ),
//       }));
//     }
//   };

//   return (
//     <>
//       <div className="container-1">
//         <Navbar />
//       </div>
//       <div className="search-cont-2">
//         <div className="mess-0">
//           <div className="mess-1">
//             <h2>Messaging</h2>
//           </div>

//           <div className="mess-2">
//             <div className="mess-3 left-panel">
//               {/* <div style={{ padding: 8 }}>
//                 <div style={{ fontWeight: 700, marginBottom: 6 }}>
//                   All Users (Test)
//                 </div>
//                 <div
//                   style={{
//                     maxHeight: 220,
//                     overflowY: "auto",
//                     border: "1px solid #eee",
//                     borderRadius: 8,
//                   }}
//                 >
//                   {users.map((u) => {
//                     const name =
//                       `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
//                       u.email;
//                     return (
//                       <div
//                         key={u.id}
//                         onClick={() => startChatWith(u)}
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 8,
//                           padding: "10px 12px",
//                           cursor: "pointer",
//                           borderBottom: "1px solid #f5f5f5",
//                         }}
//                       >
//                         <img
//                           src={u.profile || "/avatar.jpg"}
//                           alt={name}
//                           style={{ width: 32, height: 32, borderRadius: "50%" }}
//                         />
//                         <div>
//                           <div style={{ fontWeight: 600 }}>{name}</div>
//                           <div style={{ fontSize: 12, color: "#666" }}>
//                             {u.email}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   {users.length === 0 && (
//                     <div style={{ padding: 12, color: "#666" }}>
//                       No users found
//                     </div>
//                   )}
//                 </div>
//               </div> */}

//               <div className="mess-3-1">
//                 {loadingConvos ? (
//                   <LoadMessage />
//                 ) : convos.length === 0 ? (
//                   <div
//                     style={{
//                       textAlign: "center",
//                       padding: "20px",
//                       color: "#666",
//                     }}
//                   >
//                     No conversations found
//                   </div>
//                 ) : (
//                   convos.map((c) => {
//                     const name =
//                       `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() ||
//                       c.email;
//                     const isActive =
//                       active?.conversation_id === c.conversation_id;
//                     return (
//                       <>
//                         <div
//                           className={`mess-4 conversation-item ${
//                             isActive ? "active" : ""
//                           }`}
//                           key={c.conversation_id}
//                           onClick={() =>
//                             openConversation(
//                               c.conversation_id,
//                               c.peer_id,
//                               name,
//                               c.profile,
//                               c.university
//                             )
//                           }
//                         >
//                           <img
//                             src={c.profile || "/avatar.jpg"}
//                             alt={name}
//                             style={{
//                               width: 50,
//                               height: 50,
//                               borderRadius: "50%",
//                             }}
//                           />
//                           <div style={{ flex: 1 }}>
//                             <div
//                               style={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                                 gap: "6px",
//                               }}
//                             >
//                               <div style={{ fontWeight: 600 }}>{name}</div>
//                               {c.unread_count > 0 && (
//                                 <span className="pill">{c.unread_count}</span>
//                               )}
//                             </div>
//                             <div
//                               className="conversation-text"
//                               title={c.last_message || ""}
//                             >
//                               {c.last_message || "Say hi 👋"}
//                             </div>
//                           </div>
//                         </div>
//                       </>
//                     );
//                   })
//                 )}
//               </div>
//             </div>

//             {/* RIGHT: active conversation */}
//             <div className="mess-7">
//               {!active ? (
//                 <div className="empty-state">
//                   <div>Select a chat</div>
//                   <div className="subtitle">
//                     Pick a conversation from the left
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="mess-8">
//                     {active && (
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "12px",
//                         }}
//                       >
//                         <img
//                           src={active.profile || "/avatar.jpg"}
//                           alt={active.peer_name}
//                           style={{ width: 40, height: 40, borderRadius: "50%" }}
//                         />
//                         <div>
//                           <div style={{ fontWeight: 600, fontSize: "16px" }}>
//                             {active.peer_name}
//                           </div>
//                           <div style={{ fontSize: "13px", color: "#666" }}>
//                             {active.university ||
//                               "University info not available"}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="mess-9" style={{ overflowY: "auto" }}>
//                     {loadingMsgs && (
//                       // <div
//                       //   style={{
//                       //     display: "flex",
//                       //     justifyContent: "center",
//                       //     margin: "10px 0",
//                       //     color: "#666",
//                       //     fontStyle: "italic",
//                       //   }}
//                       // >
//                       //   Loading messages...
//                       // </div>
//                       <LoadMess2 />
//                     )}

//                     {msgs.map((m) => {
//                       const mine = m.sender_id === me?.id;
//                       return (
//                         <div
//                           key={m.id}
//                           style={{
//                             display: "flex",
//                             justifyContent: mine ? "flex-end" : "flex-start",
//                             margin: "6px 0",
//                             gap: 8,
//                             opacity: m.pending ? 0.6 : 1,
//                           }}
//                         >
//                           {!mine && (
//                             <img
//                               src={m.sender_profile || "/avatar.jpg"}
//                               alt="profile"
//                               style={{
//                                 width: 28,
//                                 height: 28,
//                                 borderRadius: "50%",
//                               }}
//                             />
//                           )}
//                           <div
//                             style={{
//                               maxWidth: "70%",
//                               background: mine ? "#DCF8C6" : "#f1f1f1",
//                               borderRadius: 12,
//                               padding: "8px 12px",
//                               whiteSpace: "pre-wrap",
//                               wordBreak: "break-word",
//                               border: m.failed ? "1px solid red" : "none",
//                             }}
//                           >
//                             {m.body}
//                             {m.pending && " ⏳"}
//                             {m.failed && " ❌"}
//                           </div>
//                         </div>
//                       );
//                     })}
//                     <div ref={bottomRef} />
//                   </div>

//                   {/* Only show input box if chat is active */}
//                   {active && (
//                     <div className="mess-10">
//                       <div className="input-wrapper">
//                         <textarea
//                           placeholder="Write a message..."
//                           value={text}
//                           maxLength={1000}
//                           onChange={(e) => setText(e.target.value)}
//                           onKeyDown={(e) =>
//                             e.key === "Enter" &&
//                             !e.shiftKey &&
//                             (e.preventDefault(), send())
//                           }
//                           rows={1}
//                           className="message-input"
//                         />
//                         <button onClick={send} className="send-btn">
//                           <FiSend size={20} />
//                         </button>
//                       </div>
//                       <div className="char-count">{text.length}/1000</div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="homecontainer-3">
//           <div className="homecontainer-3-1">
//             <h3>AroundU News</h3>
//             <h4>Top-stories</h4>
//             {newsArray.map((item, index) => {
//               const [title, details] = item.split(";");
//               return (
//                 <div key={index} className="news-item">
//                   <h5>{title.trim()}</h5>
//                   <p>{details.trim()}</p>
//                 </div>
//               );
//             })}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//               }}
//             >
//               <FaChevronDown title="search" size={14} className="icon" />
//               Show more
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Messages;
import "./messages.css";
import Line from "../utils/line";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FiSend } from "react-icons/fi";
import LoadMessage from "../Loading/LoadMessages";
import { FaBookmark, FaChevronDown } from "react-icons/fa";
import LoadMess2 from "../Loading/LoadMess2";
import Navbar from "../Homepage/Navbar";
import LostFound from "../LostFound/LostFound";

const API_BASE = process.env.REACT_APP_SERVER;
function Messages() {
  const token = localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user"));

  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [msgsCache, setMsgsCache] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");

  const [users, setUsers] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);

  // mobile open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const newsArray = [
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
    "More recruiters get AI savvy; 5h ago • 3,599 readers",
    "What's shaping IT deals; 5h ago • 3,294 readers",
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
    "More recruiters get AI savvy; 5h ago • 3,599 readers",
    "What's shaping IT deals; 5h ago • 3,294 readers",
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
  ];
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
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/test-users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoadingConvos(true);
    authFetch(`${API_BASE}/api/messages/conversations`)
      .then((r) => r.json())
      .then((data) => setConvos(data))
      .catch(console.error)
      .finally(() => setLoadingConvos(false)); // ✅ stop loader
  }, [token]);

  useEffect(() => {
    if (!me?.id) return;
    socket.connect();
    socket.emit("join", me.id);

    const onNew = (msg) => {
      // If active convo, append to UI
      if (msg.conversation_id === active?.conversation_id) {
        setMsgs((prev) => [...prev, msg]);
      }

      // Update cache
      setMsgsCache((prev) => ({
        ...prev,
        [msg.conversation_id]: [...(prev[msg.conversation_id] || []), msg],
      }));

      // Reorder conversations instantly
      setConvos((prev) => {
        const idx = prev.findIndex(
          (c) => c.conversation_id === msg.conversation_id
        );
        if (idx === -1) return prev; // not found
        const convo = prev[idx];
        const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        return [convo, ...others];
      });

      scrollDown();
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
      socket.disconnect();
    };
  }, [me?.id, active?.conversation_id, socket]);

  // Close mobile panel if window grows beyond breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 700 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  const openConversation = async (
    conversation_id,
    peer_id,
    peer_name,
    profile,
    university
  ) => {
    // 1) set active and open right away (instant UI)
    setActive({ conversation_id, peer_id, peer_name, profile, university });

    // open mobile slide immediately on narrow screens
    if (typeof window !== "undefined" && window.innerWidth <= 700) {
      setMobileOpen(true); // <-- move up here
    }

    // 2) serve from cache if available
    if (msgsCache[conversation_id]) {
      setMsgs(msgsCache[conversation_id]);
      // optionally mark seen without waiting
      authFetch(`${API_BASE}/api/messages/${conversation_id}/seen`, {
        method: "POST",
      }).catch(() => {});
      return;
    }

    // 3) otherwise show skeleton + fetch
    setMsgs([]);
    setLoadingMsgs(true);
    try {
      const r = await authFetch(`${API_BASE}/api/messages/${conversation_id}`);
      const data = await r.json();
      const ordered = [...data].reverse();

      setMsgs(ordered);
      setMsgsCache((prev) => ({ ...prev, [conversation_id]: ordered }));

      authFetch(`${API_BASE}/api/messages/${conversation_id}/seen`, {
        method: "POST",
      }).catch(() => {});
    } catch (err) {
      console.error(err);
      setMsgs([{ id: "err", body: "Failed to load messages", failed: true }]);
    } finally {
      setLoadingMsgs(false);
      scrollDown();
    }
  };
  const startChatWith = async (user) => {
    const convo = await authFetch(`${API_BASE}/api/messages/conversation`, {
      method: "POST",
      body: JSON.stringify({ peerId: user.id }),
    }).then((r) => r.json());

    const peerName =
      `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email;
    await openConversation(
      convo.id,
      user.id,
      peerName,
      user.profile,
      user.university
    );

    authFetch(`${API_BASE}/api/messages/conversations`)
      .then((r) => r.json())
      .then((data) => setConvos(data))
      .catch(() => {});
  };

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

    setMsgs((prev) => [...prev, optimisticMsg]);
    setMsgsCache((prev) => ({
      ...prev,
      [active.conversation_id]: [
        ...(prev[active.conversation_id] || []),
        optimisticMsg,
      ],
    }));
    setConvos((prev) => {
      const idx = prev.findIndex(
        (c) => c.conversation_id === active.conversation_id
      );
      if (idx === -1) return prev;
      const convo = {
        ...prev[idx],
        last_message: optimisticMsg.body,
      };
      const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      return [convo, ...others];
    });
    setText("");
    scrollDown();

    try {
      const msg = await authFetch(
        `${API_BASE}/api/messages/${active.conversation_id}/send`,
        { method: "POST", body: JSON.stringify({ body: optimisticMsg.body }) }
      ).then((r) => r.json());

      setMsgs((prev) =>
        prev.map((m) => (m.id === tempId ? { ...msg, pending: false } : m))
      );
      setMsgsCache((prev) => ({
        ...prev,
        [active.conversation_id]: prev[active.conversation_id].map((m) =>
          m.id === tempId ? { ...msg, pending: false } : m
        ),
      }));
      // Move active convo to top after sending
      setConvos((prev) => {
        const idx = prev.findIndex(
          (c) => c.conversation_id === active.conversation_id
        );
        if (idx === -1) return prev;
        const convo = {
          ...prev[idx],
          last_message: msg.body,
        };
        const others = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        return [convo, ...others];
      });
    } catch (err) {
      console.error(err);
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, pending: false, failed: true } : m
        )
      );
      setMsgsCache((prev) => ({
        ...prev,
        [active.conversation_id]: prev[active.conversation_id].map((m) =>
          m.id === tempId ? { ...m, pending: false, failed: true } : m
        ),
      }));
    }
  };

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="search-cont-2">
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
                            c.conversation_id,
                            c.peer_id,
                            name,
                            c.profile,
                            c.university
                          )
                        }
                      >
                        <img
                          src={c.profile || "/avatar.jpg"}
                          alt={name}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{name}</div>
                            {c.unread_count > 0 && (
                              <span className="pill">{c.unread_count}</span>
                            )}
                          </div>
                          <div
                            className="conversation-text"
                            title={c.last_message || ""}
                          >
                            {c.last_message || "Say hi 👋"}
                          </div>
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
                          <img
                            src={active.profile || "/avatar.jpg"}
                            alt={active.peer_name}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "16px" }}>
                              {active.peer_name}
                            </div>
                            <div style={{ fontSize: "13px", color: "#666" }}>
                              {active.university ||
                                "University info not available"}
                            </div>
                          </div>
                        </div>

                        {/* mobile back button */}
                        <button
                          className="mobile-back-btn"
                          onClick={() => setMobileOpen(false)}
                          aria-label="Back"
                        >
                          ← Back
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
        <LostFound />
      </div>
    </>
  );
}

export default Messages;
