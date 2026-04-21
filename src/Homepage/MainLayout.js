import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./Navbar";
import useNotifications from "../hooks/useNotifications"; // this is for likes and comment only
import useMessagesRealtime from "../hooks/useMessagesRealtime";
const API_BASE = process.env.REACT_APP_SERVER;
export default function MainLayout() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const token = localStorage.getItem("token");
  const authFetch = (url, opts = {}) =>
    fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

  const { data: convos = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await authFetch(`${API_BASE}/api/messages/conversations`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60 * 1000, // 🔥 important
    placeholderData: [],
  });
  const me = JSON.parse(localStorage.getItem("user"));
  useMessagesRealtime(activeConversationId, me?.id);

  useNotifications();
  return (
    <>
      <div className="container-1">
        <Navbar />
      </div>

      <div className="container-2">
        <div className="homecontainer">
          <Outlet context={{ setActiveConversationId }} />;
        </div>
      </div>
    </>
  );
}
