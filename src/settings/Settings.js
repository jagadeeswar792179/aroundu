import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./settings.css";
import RightArrowIcon from "../icons/RightArrowIcon";
import RecoveryEmailModal from "../settings modals/RecoveryEmailModal.";
import ChangePasswordModal from "../settings modals/ChangePasswordModal";
import PhoneNumberModal from "../settings modals/PhoneNumberModal";
import DeleteAccountModal from "../settings modals/DeleteAccountModal";
import { MdDeleteOutline } from "react-icons/md";
import { FiTrash } from "react-icons/fi";
import NotificationPreferencesModal from "../settings modals/NotificationPreferencesModal";

const Settings = () => {
  const navigate = useNavigate();

  const [modal, setModal] = useState(null);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <div className="container-2">
      <div className="settings-page">
        <h2 style={{ margin: "20px" }}>Settings</h2>

        <div className="settings-item" onClick={() => setModal("recovery")}>
          <div>Add Recovery Mail</div>
          <div>
            <RightArrowIcon />
          </div>
        </div>
        <div
          className="settings-item"
          onClick={() => setModal("notifications-preferences")}
        >
          <div>Notifications Preferences</div>
          <div>
            <RightArrowIcon />
          </div>
        </div>
        <div className="settings-item" onClick={() => setModal("password")}>
          <div>Change Password</div>
          <div>
            <RightArrowIcon />
          </div>
        </div>

        <div className="settings-item" onClick={() => setModal("phone")}>
          <div>Add Phone Number</div>
          <div>
            <RightArrowIcon />
          </div>
        </div>
        <div
          className="settings-item logout-hide-small-screen"
          onClick={handleLogout}
        >
          <div>Log Out</div>
          <div>
            <div>
              <svg
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
            </div>
          </div>
        </div>
        <div
          className="settings-item"
          onClick={() => setModal("delete-account")}
        >
          <div style={{ color: "#d93c3c" }}>Delete Account</div>
          <div>
            <FiTrash size={20} style={{ color: "#d93c3c" }} />
          </div>
        </div>
        {modal === "recovery" && (
          <RecoveryEmailModal close={() => setModal(null)} />
        )}
        {modal === "phone" && <PhoneNumberModal close={() => setModal(null)} />}
        {modal === "password" && (
          <ChangePasswordModal close={() => setModal(null)} />
        )}
        {modal === "delete-account" && (
          <DeleteAccountModal close={() => setModal(null)} />
        )}
        {modal === "notifications-preferences" && (
          <NotificationPreferencesModal close={() => setModal(null)} />
        )}
      </div>
    </div>
  );
};

export default Settings;
