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
import { useUser } from "../UserContext/UserContext";
function Homepage() {
  const { profile } = useUser();
  const [ModalType, setModalType] = useState(null);
  const { location, status } = useLocation();
  const navigate = useNavigate();
  const [number, setNumber] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const handlemodal = (num) => {
    setModalType(num);
    setModalOpen(true);
  };
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
                {status ? (
                  <p>{status}</p>
                ) : (
                  <p>
                    {" "}
                    {location.city}, {location.state}, {location.country}{" "}
                  </p>
                )}
                <p>{profile?.course}</p>
                <p>{profile?.experience[0]?.title}</p>
              </div>
            ) : (
              <UsercardLoad />
            )}

            {
              <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                {ModalType === 1 ? <ProfileViewers /> : <Bugreport />}
              </Modal>
            }
            <div className="homecontainer-1-3">
              <div onClick={() => handlemodal(1)}>
                <MdOutlineRemoveRedEye
                  title="profile-viewers"
                  size={24}
                  className="icon"
                />
                Profile viewers
              </div>
              <div
                onClick={() => navigate("/saved-items")}
                style={{ cursor: "pointer" }}
              >
                <FaBookmark title="saved items" size={24} className="icon" />
                Saved items
              </div>

              <div onClick={() => handlemodal(2)}>
                <MessageCircleWarning size={24} className="icon" />
                Report a bug
              </div>
            </div>
          </div>

          <PostFetch profile={profile} />
          <LostFound />
        </div>
      </div>
    </>
  );
}
export default Homepage;
