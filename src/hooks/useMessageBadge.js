import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.REACT_APP_SERVER;

export default function useMessageBadge() {
  const token = localStorage.getItem("token");

  const fetchConvos = async () => {
    const res = await fetch(`${API_BASE}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  };

  const { data = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConvos,
    staleTime: 0, // 🔥 IMPORTANT
  });

  const unreadMessages = data.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0,
  );

  return { unreadMessages };
}
