import "./homepage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostFetch from "./PostsFetch";
import useLocation from "../utils/useLocation";
import Navbar from "./Navbar";
import Modal from "../utils/Modal";
import ProfileViewers from "../profileview/ProfileViewers";
import Bugreport from "../bugreport/Bugreport";
import UsercardLoad from "../Loading/usercardload";
import LostFound from "../LostFound/LostFound";
import { useUser } from "../UserContext/UserContext";

function Homepage() {
  const [ModalType, setModalType] = useState(null);
  const { location, status } = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConnectionLost, setIsConnectionLost] = useState(false);

  // ✅ CORRECT: hook at top-level
  const { user: profile, loading } = useUser();

  const handlemodal = (num) => {
    setModalType(num);
    setModalOpen(true);
  };

  useEffect(() => {
    const handleOffline = () => {
      setIsConnectionLost(true);
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>

      <div className="container-2">
        <div className="homecontainer">
          <div className="homecontainer-1">
            {loading ? (
              <UsercardLoad />
            ) : profile ? (
              <div className="homecontainer-1-1">
                <img
                  src={profile.profile || "/avatar.jpg"}
                  className="icon"
                  alt="profile"
                />
                <h3>
                  {profile.first_name} {profile.last_name}
                </h3>
                <p>{profile.course}</p>
                <p>{profile.experience?.[0]?.title}</p>

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

            {/* Profile viewers / bug modal */}
            <Modal isOpen={isModalOpen}>
              {ModalType === 1 ? (
                <ProfileViewers onClose={() => setModalOpen(false)} />
              ) : (
                <Bugreport onClose={() => setModalOpen(false)} />
              )}
            </Modal>

            {/* Connection lost modal */}
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

            <div className="homecontainer-1-3">
              <div onClick={() => handlemodal(1)} style={{ cursor: "pointer" }}>
                Profile viewers
              </div>

              <div
                onClick={() => navigate("/saved-items")}
                style={{ cursor: "pointer" }}
              >
                Saved items
              </div>

              <div onClick={() => handlemodal(2)} style={{ cursor: "pointer" }}>
                Report a bug
              </div>
            </div>
          </div>

          {/* Feed */}
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
