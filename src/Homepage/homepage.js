import "./homepage.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaChevronDown } from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { MdGroups } from "react-icons/md";
import { RiNewsLine } from "react-icons/ri";
import { SlCalender } from "react-icons/sl";
import Messages from "../messgaes/messages";
import { MessageCircleWarning } from "lucide-react";
import Notifications from "../notifications/notification";
import Profile from "../profile/profile";
import PostFetch from "./PostsFetch";
import useLocation from "../utils/useLocation";
import Navbar from "./Navbar";
import Modal from "../utils/Modal";
import { TbMessageReport } from "react-icons/tb";
import SavedPosts from "./SavedPosts";
import ProfileViewers from "../profileview/ProfileViewers";
import Bugreport from "../bugreport/Bugreport";
import UsercardLoad from "../Loading/usercardload";
function Homepage() {
  const server = "https://aroundubackend.onrender.com";
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ModalType, setModalType] = useState(null);
  const { location, status } = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${server}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

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
  const [number, setNumber] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const handlemodal = (num) => {
    setModalType(num);
    setModalOpen(true);
  };
  return (
    <>
      <div className="container-1">
        <Navbar setNumber={setNumber} profile={profile} />
      </div>
      <div className="container-2">
        <div className="homecontainer">
          {number === 4 ? (
            <Profile />
          ) : (
            <>
              {(number === 1 || number === 3) && (
                <>
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
                            {location.city}, {location.state},{" "}
                            {location.country}{" "}
                          </p>
                        )}
                        <p>{profile?.course}</p>
                        <p>{profile?.experience[0]?.title}</p>
                      </div>
                    ) : (
                      <UsercardLoad />
                    )}

                    {
                      <Modal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                      >
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
                        onClick={() => setNumber(5)}
                        style={{ cursor: "pointer" }}
                      >
                        <FaBookmark
                          title="saved items"
                          size={24}
                          className="icon"
                        />
                        Saved items
                      </div>

                      <div onClick={() => handlemodal(2)}>
                        <MessageCircleWarning size={24} className="icon" />
                        Report a bug
                      </div>
                    </div>
                  </div>
                  {number === 3 ? (
                    <Notifications />
                  ) : (
                    <PostFetch profile={profile} />
                  )}
                </>
              )}
              {number === 2 && <Messages />}
              {number === 5 && <SavedPosts />}
              <br />
              <div className="homecontainer-3">
                <div className="homecontainer-3-1">
                  <h3>AroundU News</h3>
                  <h4>Top-stories</h4>
                  {newsArray.map((item, index) => {
                    const [title, details] = item.split(";");
                    return (
                      <div key={index} className="news-item">
                        <h5>{title.trim()}</h5>
                        <p>{details.trim()}</p>
                      </div>
                    );
                  })}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaChevronDown title="search" size={14} className="icon" />
                    Show more
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
export default Homepage;
