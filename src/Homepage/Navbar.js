import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../UserContext/UserContext";
import "./navbar.css";
import Modal from "../utils/Modal";
import ProfileViewers from "../profileview/ProfileViewers";
import Bugreport from "../bugreport/Bugreport";

export default function Navbar() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [ModalType, setModalType] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [kebabOpen, setKebabOpen] = useState(false);
  const drawerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!kebabOpen) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setKebabOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setKebabOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p>Home</p>
        </div>

        <div>
          <svg
            onClick={() => navigate("/messages")}
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
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <p>Messages</p>
        </div>

        <div>
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
        {
          <Modal isOpen={isModalOpen}>
            {ModalType === 1 ? (
              <ProfileViewers onClose={() => setModalOpen(false)} />
            ) : (
              <Bugreport onClose={() => setModalOpen(false)} />
            )}
          </Modal>
        }
        <div>
          <img
            className="profile-avatar"
            src={profile?.profile || "/avatar.jpg"}
            alt="profile"
            title="My Profile"
            onClick={() => navigate("/profile")}
          />
          <p>My Profile</p>
        </div>
        <div className="logout-hide-small-screen">
          <svg
            onClick={handleLogout}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="icon"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <p>LogOut</p>
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

        <nav className="kebab-list">
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

          <div
            onClick={() => handlemodal(1)}
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
          {/* <div
            onClick={() => navigate("/saved-items")}
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
          </div> */}

          <div
            onClick={() => handlemodal(2)}
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
            onClick={() => navigate("/lost-found")}
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
        </nav>
      </aside>
    </div>
  );
}
