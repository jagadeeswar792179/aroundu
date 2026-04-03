import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../UserContext/UserContext";
import "./navbar.css";
import useMessageBadge from "../hooks/useMessageBadge";
import { motion } from "framer-motion";

import Modal from "../utils/Modal";
import { useLocation } from "react-router-dom";
import ProfileViewers from "../profileview/ProfileViewers";
import Bugreport from "../bugreport/Bugreport";
import useNotifications from "../hooks/useNotifications";

export default function Navbar() {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [ModalType, setModalType] = useState(null);
  const { notifications, unread, setUnread } = useNotifications();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [kebabOpen, setKebabOpen] = useState(false);
  const drawerRef = useRef(null);
  const { unreadMessages } = useMessageBadge();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const { user: profile, loading } = useUser();

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchInput.trim() !== "") {
        navigate(`/search?q=${encodeURIComponent(searchInput)}`);
      }
    }
  };
  const handlemodal = (num) => {
    setModalType(num);
    setModalOpen(true);
  };
  useEffect(() => {
    function onDocClick(e) {
      if (!kebabOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setKebabOpen(false);
        document.body.style.overflow = ""; // ✅ restore scroll here
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") {
        setKebabOpen(false);
        document.body.style.overflow = ""; // ✅ and here
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [kebabOpen]);
  useEffect(() => {
    document.body.style.overflow = kebabOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [kebabOpen]);

  return (
    <div className="navbar">
      <div className="searchbar">
        <img
          src="/logo.png"
          alt="Logo"
          style={{ width: 50, height: 50, borderRadius: "50%" }}
        />

        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
          className="search-input"
        />
      </div>

      <div className="navbar-1">
        <div>
          <svg
            onClick={() => navigate("/home")}
            className={`icon ${location.pathname.startsWith("/home") ? "iconactive" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p>Home</p>
        </div>

        <div style={{ position: "relative" }}>
          <svg
            onClick={() => navigate("/messages")}
            className={`icon ${location.pathname.startsWith("/messages") ? "iconactive" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          {/* {unreadMessages > 0 && (
            <span className="notif-badge">{unreadMessages}</span>
          )} */}
          <p>Messages</p>
        </div>

        <div className="logout-hide-small-screen">
          <svg
            onClick={() => navigate(`/explore`)}
            className={`icon ${location.pathname.startsWith("/explore") ? "iconactive" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <p>Explore</p>
        </div>
        <div style={{ position: "relative" }}>
          <svg
            onClick={() => navigate("/notifications")}
            className={`icon ${location.pathname.startsWith("/notifications") ? "iconactive" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>

          {unread > 0 && <span className="notif-badge">{unread}</span>}
          <p>Notifications</p>
        </div>
        <div className="logout-hide-small-screen">
          <svg
            onClick={() => navigate("/marketplace")}
            className={`icon ${location.pathname.startsWith("/marketplace") ? "iconactive" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l1-5h16l1 5" />
            <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <p>Marketplace</p>
        </div>
        {
          <Modal isOpen={isModalOpen}>
            {ModalType === 1 ? (
              <ProfileViewers onClose={() => setModalOpen(false)} />
            ) : (
              <Bugreport onClose={() => setModalOpen(false)} />
            )}
          </Modal>
        }

        <div className="logout-hide-small-screen">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            className={`icon ${location.pathname.startsWith("/settings") ? "iconactive" : ""}`}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            color="#747474ff"
            onClick={() => navigate("/settings")}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.66 0 1.26-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.15.6 1.82.33h.01c.61-.25 1-.85 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51.67.27 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.15-.33 1.82v.01c.25.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" />
          </svg>
          <p>Settings</p>
        </div>
        <div>
          <img
            src={profile?.profile || "/avatar.jpg"}
            alt="profile"
            title="My Profile"
            className={`profile-avatar ${location.pathname === "/profile" ? "iconactive" : ""}`}
            onClick={() => navigate("/profile")}
          />
          <p>My Profile</p>
        </div>

        <div className="hider-big">
          <svg
            onClick={() => {
              setKebabOpen(true);
              // optional: prevent background scroll
              document.body.style.overflow = "hidden";
            }}
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* cleaner kebab: 6, 12, 18 */}
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
          <p>Kebab</p>
        </div>
      </div>

      {/* Overlay */}
      {kebabOpen && (
        <div
          className="kebab-overlay"
          onClick={() => {
            setKebabOpen(false);
            document.body.style.overflow = ""; // restore
          }}
        />
      )}

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`kebab-drawer ${kebabOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Quick menu"
      >
        <div className="kebab-header">
          <h3>Menu</h3>
          <button
            className="kebab-close"
            onClick={() => {
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div className="kebab-list">
          <div className="flex-r center-c">
            <svg
              onClick={handleLogout}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="#dc4848ff"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style={{ marginRight: "10px" }}
            >
              {" "}
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />{" "}
              <polyline points="16 17 21 12 16 7" />{" "}
              <line x1="21" x2="9" y1="12" y2="12" />{" "}
            </svg>{" "}
            <p>LogOut</p>{" "}
          </div>
          <div className="flex-r center-c">
            <svg
              onClick={() => navigate(`/explore`)}
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <p>Explore</p>
          </div>
          <div className="flex-r center-c" style={{ gap: "10px" }}>
            <svg
              onClick={() => {
                navigate("/marketplace");
                setKebabOpen(false);
                document.body.style.overflow = "";
              }}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="#205b99"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l1-5h16l1 5" />
              <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <p>Marketplace</p>
          </div>
          <div
            onClick={() => {
              handlemodal(1);
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            style={{ cursor: "pointer" }}
            className="flex-r center-c"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="#205b99"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style={{ marginRight: "10px" }}
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Profile viewers
          </div>
          <div
            onClick={() => {
              navigate("/saved-items");
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            style={{ cursor: "pointer" }}
            className="flex-r center-c"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginRight: "10px" }}
              color="#205b99"
            >
              <path
                d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15.5L12 17l-7.5 3.5V5A1.5 1.5 0 0 1 6 3.5Z"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinejoin="round"
              />
            </svg>
            Saved items
          </div>
          <div
            onClick={() => {
              handlemodal(2);
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            style={{ cursor: "pointer" }}
            className="flex-r center-c"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="#205b99"
              stroke="currentColor"
              style={{ marginRight: "10px" }}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" x2="4" y1="22" y2="15"></line>
            </svg>
            Report a bug
          </div>
          <div
            onClick={() => {
              navigate("/lost-found");
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            style={{ cursor: "pointer" }}
            className="flex-r center-c"
          >
            <svg
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              color="#205b99"
              stroke="currentColor"
              style={{ marginRight: "10px" }}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a4 4 0 0 1 8 0v2" />
              <circle cx="12" cy="13" r="3" />
              <path d="m16 16 2 2" />
            </svg>
            Lost & Found
          </div>
          <div
            onClick={() => {
              navigate("/settings");
              setKebabOpen(false);
              document.body.style.overflow = "";
            }}
            className="flex-r center-c"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              color="#747474ff"
              onClick={() => navigate("/settings")}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.66 0 1.26-.39 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.46.46 1.15.6 1.82.33h.01c.61-.25 1-.85 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51.67.27 1.36.13 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.15-.33 1.82v.01c.25.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" />
            </svg>
            <p>Settings</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
