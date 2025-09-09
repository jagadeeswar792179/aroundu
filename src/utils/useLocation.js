import { useState, useEffect } from "react";

export default function useLocation() {
  const [location, setLocation] = useState({
    city: "",
    state: "",
    country: "",
  });
  const [status, setStatus] = useState("Fetching location...");

  useEffect(() => {
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
          setLocation({
            city: address.city || address.town || address.village || "",
            state: address.state || "",
            country: address.country || "",
          });
          setStatus("");
        } catch (err) {
          setStatus("Failed to fetch location data.");
        }
      },
      () => {
        setStatus("Could not get location. Permission denied.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return { location, status };
}
