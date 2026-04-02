import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.REACT_APP_SERVER;

export default function useMessageBadge() {
  const token = localStorage.getItem("token");

  const fetchConvos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // ✅ Normalize response to ALWAYS be an array
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.conversations)) return data.conversations;

      return []; // fallback
    } catch (err) {
      console.error("Error fetching conversations:", err);
      return []; // prevent crash
    }
  };

  const { data = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConvos,
    staleTime: 0,
    enabled: !!token, // 🔥 VERY IMPORTANT (prevents running when logged out)
  });

  // ✅ Safe reduce (no crash guaranteed)
  const unreadMessages = (Array.isArray(data) ? data : []).reduce(
    (sum, c) => sum + (c?.unread_count || 0),
    0,
  );

  return { unreadMessages };
}
