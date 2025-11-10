import { useNavigate } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";
import { useUser } from "../UserContext/UserContext";

import {
  FaHome,
  FaEnvelope,
  FaBell,
  FaCompass,
  FaSearch,
} from "react-icons/fa";
import { useState } from "react";
import "./navbar.css";
export default function Navbar() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [searchInput, setSearchInput] = useState("");

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

  return (
    <div className="navbar">
      <div className="searchbar">
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
          }}
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
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            onClick={() => navigate("/home")}
            className="icon"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          {/* <FaHome
            title="Home"
            size={24}
            className="icon"
            onClick={() => navigate("/home")}
          /> */}
          <p>Home</p>
        </div>

        <div>
          {/* <FaEnvelope title="Messages" size={24} className="icon" /> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            onClick={() => navigate("/messages")}
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="icon"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <p>Messages</p>
        </div>
        <div>
          {/* <FaCompass
            title="Explore"
            size={24}
            className="icon"
            onClick={() => navigate(`/explore`)}
          />{" "} */}
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
        <div>
          {/* <IoLogOut onClick={handleLogout} className="icon" size={28} /> */}
          <svg
            onClick={handleLogout}
            xmlns="http://www.w3.org/2000/svg"
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
      </div>
    </div>
  );
}
