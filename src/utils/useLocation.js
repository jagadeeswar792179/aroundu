import { useState, useEffect } from "react";
import { getToken } from "../utils/auth"; // adjust path

export default function useLocation() {
  const [location, setLocation] = useState({ city: "", state: "", country: "" });
  const [status, setStatus] = useState("Fetching location...");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // user not logged in yet -> don't try update-location
      setStatus("");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const address = data.address || {};

          const finalLocation = {
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
          };

          setLocation(finalLocation);
          setStatus("");

          const formatted =
            `${finalLocation.city}, ${finalLocation.state}, ${finalLocation.country}`.replace(
              /(^[,\s]+)|([,\s]+$)/g,
              ""
            );

          if (!formatted) return;

          const resp = await fetch(
            `${process.env.REACT_APP_SERVER}/api/user/update-location`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ location: formatted }),
            }
          );

          // IMPORTANT: don't break login flow if it fails
          if (!resp.ok) console.warn("update-location failed:", resp.status);
        } catch (err) {
          setStatus("Failed to fetch location data.");
        }
      },
      () => setStatus("Could not get location. Permission denied."),
      { enableHighAccuracy: true }
    );
  }, []);

  return { location, status };
}