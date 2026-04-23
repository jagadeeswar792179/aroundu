import { useState, useEffect } from "react";
import api from "../utils/api";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import "./modalcss/NotificationPreferencesModal.css";
export default function NotificationPreferencesModal({ close }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ padding: "0px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px",
          }}
        >
          <h3>Notification Preferences</h3>
          <FiX style={{ cursor: "pointer" }} onClick={close} />
        </div>
        <div>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Messages
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Post Likes
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Comments
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          {/* <label className="flex-r jspacebtw notifications-preferences-item">
            Marketplace Updates
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Lost & Found
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Campus Events
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Free Time Bookings
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label>
          <label className="flex-r jspacebtw notifications-preferences-item">
            Security Alerts
            <div className="toggle-switch">
              <input type="checkbox" />
              <span className="slider" />
            </div>
          </label> */}
        </div>
      </div>
    </div>
  );
}
