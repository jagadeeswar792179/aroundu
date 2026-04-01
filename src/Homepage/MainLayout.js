import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import useNotifications from "../hooks/useNotifications"; // adjust path if needed
import useMessagesRealtime from "../hooks/useMessagesRealtime";
export default function MainLayout() {
  useNotifications();
  useMessagesRealtime();
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>

      <div className="container-2">
        <div className="homecontainer">
          <Outlet />
        </div>
      </div>
    </>
  );
}
