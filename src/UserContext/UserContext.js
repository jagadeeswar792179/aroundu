// src/UserContext/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // 1️⃣ Start with user from localStorage so homepage has data instantly
  const storedUser = localStorage.getItem("user");
  const [profile, setProfile] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [loading, setLoading] = useState(false); // only for the /me refresh

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // not logged in → nothing to fetch

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_SERVER}/api/user/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Profile /me failed with status:", res.status);
          return;
        }

        const data = await res.json();

        const user = data.user ?? data; // supports both {user: {...}} or plain object
        setProfile(user);
        // keep localStorage in sync
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        console.error("Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
