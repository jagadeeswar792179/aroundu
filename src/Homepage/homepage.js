import "./homepage.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaChevronDown } from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Messages from "../messgaes/messages";
import { MessageCircleWarning } from "lucide-react";
import Notifications from "../notifications/notification";
import Profile from "../profile/profile";
import PostFetch from "./PostsFetch";
import useLocation from "../utils/useLocation";
import Navbar from "./Navbar";
import Modal from "../utils/Modal";
import SavedPosts from "./SavedPosts";
import ProfileViewers from "../profileview/ProfileViewers";
import Bugreport from "../bugreport/Bugreport";
import UsercardLoad from "../Loading/usercardload";
import LostFound from "../LostFound/LostFound";
import { getUserFromToken } from "../utils/auth";
import { getToken, isTokenExpired, clearAuth } from "../utils/auth"; // ⬅️ NEW
function Homepage() {
  const [ModalType, setModalType] = useState(null);
  const { location, status } = useLocation();
  const navigate = useNavigate();
  const [number, setNumber] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConnectionLost, setIsConnectionLost] = useState(false);
  const handlemodal = (num) => {
    setModalType(num);
    setModalOpen(true);
  };

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (user) setProfile(user); // ✔ store user details from token
  }, []);
  // 🔹 Check token on mount
  useEffect(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 🔹 Show popup if connection goes offline
  useEffect(() => {
    const handleOffline = () => {
      setIsConnectionLost(true);
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  // if not loading and there's an error or no profile → push to login

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>
      <div className="container-2">
        <div className="homecontainer">
          <div className="homecontainer-1">
            {profile ? (
              <div className="homecontainer-1-1">
                <img
                  src={profile?.profile || "/avatar.jpg"}
                  className="icon"
                  alt="profile"
                />
                <h3>
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p>{profile?.course}</p>
                <p>{profile?.experience?.[0]?.title}</p> {/* ✅ safer */}
                {status ? (
                  <p>{profile.location}</p>
                ) : (
                  <p>
                    {location.city}, {location.state}, {location.country}
                  </p>
                )}
              </div>
            ) : (
              <UsercardLoad />
            )}

            {
              <Modal isOpen={isModalOpen}>
                {ModalType === 1 ? (
                  <ProfileViewers onClose={() => setModalOpen(false)} />
                ) : (
                  <Bugreport onClose={() => setModalOpen(false)} />
                )}
              </Modal>
            }
            {
              <Modal isOpen={isConnectionLost}>
                <div style={{ padding: "16px", textAlign: "center" }}>
                  <h3>Connection lost</h3>
                  <p>
                    It looks like your internet connection was interrupted.
                    Please reload the page once your connection is back.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: "12px",
                      padding: "8px 16px",
                      borderRadius: "30px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: "#205b99",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Reload page
                  </button>
                </div>
              </Modal>
            }
            <div className="homecontainer-1-3">
              <div onClick={() => handlemodal(1)} style={{ cursor: "pointer" }}>
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
                onClick={() => navigate("/saved-items")}
                style={{ cursor: "pointer" }}
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

              <div onClick={() => handlemodal(2)} style={{ cursor: "pointer" }}>
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
            </div>
          </div>

          <PostFetch profile={profile} />
          <div className="hider-small">
            <LostFound />
          </div>
        </div>
      </div>
    </>
  );
}
export default Homepage;
