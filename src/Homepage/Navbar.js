import { CiLogout } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineLogout } from "react-icons/hi";
import { IoLogOut } from "react-icons/io5";
import {
  FaHome,
  FaEnvelope,
  FaBell,
  FaCompass,
  FaSearch,
} from "react-icons/fa";
import { useState } from "react";
import "./navbar.css";
export default function Navbar({ setNumber, profile }) {
  const navigate = useNavigate();
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
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
          className="search-input"
        />

        <FaSearch
          title="search"
          size={20}
          className="icon-search"
          onClick={handleSearch}
        />
      </div>

      <div className="navbar-1">
        <div>
          <FaHome
            title="Home"
            size={24}
            className="icon"
            onClick={() => navigate("/home")}
          />
          <p>Home</p>
        </div>

        <div>
          <FaEnvelope
            title="Messages"
            size={24}
            className="icon"
            onClick={() => navigate("/messages")}
          />
          <p>Messages</p>
        </div>
        <div>
          <FaCompass
            title="Explore"
            size={24}
            className="icon"
            onClick={() => navigate(`/explore`)}
          />
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
          <IoLogOut onClick={handleLogout} className="icon" size={28} />
          <p>LogOut</p>
        </div>
      </div>
    </div>
  );
}
