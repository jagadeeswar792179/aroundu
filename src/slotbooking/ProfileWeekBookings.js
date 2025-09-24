// ProfileWeekBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./weekbookings.css";

const server = process.env.REACT_APP_SERVER;

/* helpers (same as before) */
function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff =
    day < weekStartsOn ? -(7 - (weekStartsOn - day)) : weekStartsOn - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function formatDateISO(d) {
  return d.toISOString().split("T")[0];
}
function dayLabel(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};
function slotHasEnded(slot) {
  try {
    return new Date(slot.end_ts).getTime() <= Date.now();
  } catch {
    return false;
  }
}

/* Component */
export default function ProfileWeekBookings({ profileOwnerId }) {
  const today = new Date();
  const todayIso = formatDateISO(today);
  const weekStart = useMemo(() => startOfWeek(today, 1), []);
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [selectedDayIso, setSelectedDayIso] = useState(todayIso);
  const [instances, setInstances] = useState({}); // date -> array
  const [loadingDay, setLoadingDay] = useState(false);

  // map slot_instance_id -> status string ('pending'|'accepted'|'rejected'|'cancelled')
  const [myRequestsMap, setMyRequestsMap] = useState({});

  // modal state
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqSlot, setReqSlot] = useState(null);
  const [reqMessage, setReqMessage] = useState("");
  const [requesting, setRequesting] = useState(false);

  /* Fetch current user's requests (all statuses) and return a map slot_instance_id->status
     We'll fetch limited rows (pagination) but set limit high enough for typical use (100).
     The backend GET /api/requests returns authenticated user's requests when no professorId passed.
  */
  async function fetchMyRequestsMap() {
    try {
      const q = new URLSearchParams();
      q.set("limit", "100");
      q.set("offset", "0");
      // fetch all statuses for user's requests (let backend return them)
      const url = `${server}/api/requests?${q.toString()}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) {
        // not authenticated or error -> clear map
        setMyRequestsMap({});
        return {};
      }
      const body = await res.json();
      const arr = body.requests || [];
      const m = {};
      arr.forEach((r) => {
        if (r.slot_instance_id)
          m[String(r.slot_instance_id)] = r.status || null;
      });
      setMyRequestsMap(m);
      return m;
    } catch (err) {
      console.warn("fetchMyRequestsMap error", err);
      setMyRequestsMap({});
      return {};
    }
  }

  /* Fetch instances for a given date and annotate with my_request_status from myRequestsMap */
  /* Fetch instances for a given date; use server-provided my_request_status */
  async function fetchDay(dateIso) {
    if (!profileOwnerId) {
      setInstances((p) => ({ ...p, [dateIso]: [] }));
      return;
    }
    setLoadingDay(true);
    try {
      const q = new URLSearchParams();
      q.set("date", dateIso);
      q.set("professorId", profileOwnerId);
      const url = `${server}/api/slot-instances?${q.toString()}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const body = await res.json();
      const arr = Array.isArray(body.instances) ? body.instances : [];

      const annotated = arr.map((si) => ({
        ...si,
        my_request_status: si.my_request_status
          ? String(si.my_request_status)
          : null,
        pending_count: si.pending_count ? Number(si.pending_count) : 0,
      }));

      setInstances((prev) => ({ ...prev, [dateIso]: annotated }));
    } catch (err) {
      console.error("fetchDay error", err);
      setInstances((prev) => ({ ...prev, [dateIso]: [] }));
    } finally {
      setLoadingDay(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchDay(todayIso);
    // eslint-disable-next-line
  }, [profileOwnerId]);

  function onSelectDay(iso) {
    setSelectedDayIso(iso);
    fetchDay(iso);
  }

  function openRequestModal(slot) {
    if (slotHasEnded(slot) || selectedDayIso < todayIso) {
      alert("This slot is not available for requesting.");
      return;
    }
    const status = slot.my_request_status;
    if (status === "pending") {
      alert("You already have a pending request for this slot.");
      return;
    }
    if (status === "accepted") {
      alert("Your request for this slot has already been accepted.");
      return;
    }
    // if rejected/cancelled/null -> allow sending request
    setReqSlot(slot);
    setReqMessage("");
    setReqModalOpen(true);
  }

  /* POST request; after response re-fetch myRequestsMap and day to reflect authoritative DB */
  async function submitRequest(e) {
    e.preventDefault();
    if (!reqSlot) return;
    setRequesting(true);
    try {
      const res = await fetch(
        `${server}/api/slot-instances/${reqSlot.id}/request`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ message: reqMessage || null }),
        }
      );

      const body = await res.json().catch(() => null);

      if (res.ok) {
        // Optimistic update: immediately mark as pending
        setInstances((prev) => {
          const list = (prev[selectedDayIso] || []).map((si) =>
            String(si.id) === String(reqSlot.id)
              ? {
                  ...si,
                  my_request_status: "pending",
                  pending_count: (si.pending_count || 0) + 1,
                }
              : si
          );
          return { ...prev, [selectedDayIso]: list };
        });

        // Re-sync authoritative state
        await fetchDay(selectedDayIso);
        setReqModalOpen(false);
        return;
      }

      if (res.status === 409) {
        await fetchDay(selectedDayIso);
        setReqModalOpen(false);
        alert(body?.error || "You already requested this slot.");
        return;
      }

      if (res.status === 401) {
        alert("Please log in to request a slot.");
        return;
      }

      if (res.status === 403) {
        alert(body?.error || "Not authorized to request this slot.");
        return;
      }

      alert(body?.error || `Request failed (${res.status})`);
    } catch (err) {
      console.error("submitRequest error", err);
      alert("Failed to send request. See console.");
    } finally {
      setRequesting(false);
    }
  }

  /* Render helper for button label + disabled state based on my_request_status */
  function renderRequestButton(si) {
    const status = si.my_request_status; // 'pending' | 'accepted' | 'rejected' | 'cancelled' | null
    const ended = slotHasEnded(si) || selectedDayIso < todayIso;

    if (ended) {
      return <div className="wb-prev-note">Not available</div>;
    }

    if (status === "pending") {
      return (
        <button
          className="wb-btn wb-btn-disabled"
          disabled
          title="Request pending"
        >
          Requested
        </button>
      );
    }
    if (status === "accepted") {
      return (
        <button
          className="wb-btn wb-btn-disabled"
          disabled
          title="Request accepted"
        >
          Accepted
        </button>
      );
    }
    if (status === "rejected") {
      return (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 13, color: "#b91c1c" }}>Rejected</div>
          <button
            className="wb-btn wb-btn-primary"
            onClick={() => openRequestModal(si)}
          >
            Request again
          </button>
        </div>
      );
    }
    if (status === "cancelled") {
      return (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 13, color: "#6b7280" }}>Cancelled</div>
          <button
            className="wb-btn wb-btn-primary"
            onClick={() => openRequestModal(si)}
          >
            Request
          </button>
        </div>
      );
    }

    // null -> no request yet
    return (
      <button
        className="wb-btn wb-btn-primary"
        onClick={() => openRequestModal(si)}
      >
        Request
      </button>
    );
  }

  return (
    <div className="wb-root">
      <div className="wb-days">
        {days.map((d) => {
          const iso = formatDateISO(d);
          const isPast = iso < todayIso;
          const count = (instances[iso] || []).length;
          return (
            <div
              key={iso}
              className={`wb-day ${
                iso === selectedDayIso ? "wb-day-selected" : ""
              } ${isPast ? "wb-day-past" : ""}`}
              onClick={() => onSelectDay(iso)}
            >
              <div className="wb-day-title">{dayLabel(d)}</div>
              <div className="wb-day-date">{iso}</div>
              {/* <div className="wb-day-count">
                {count} free slot{count !== 1 ? "s" : ""}
              </div> */}
            </div>
          );
        })}
      </div>

      <div className="wb-panel">
        <div className="wb-panel-header">
          <h3 className="wb-panel-title">Free times for {selectedDayIso}</h3>
          <div className="wb-past-note-small">
            {selectedDayIso < todayIso ? "Past day — read-only" : ""}
          </div>
        </div>

        <div className="wb-panel-body">
          {loadingDay ? (
            <div className="wb-loading">Loading...</div>
          ) : (instances[selectedDayIso] || []).length === 0 ? (
            <div className="wb-empty">No free slots yet.</div>
          ) : (
            (instances[selectedDayIso] || []).map((si) => (
              <div key={si.id} className="wb-slot-row">
                <div>
                  <div className="wb-slot-time">
                    {new Date(si.start_ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    —{" "}
                    {new Date(si.end_ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {si.notes && <div className="wb-slot-notes">{si.notes}</div>}
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {si.pending_count
                      ? `${si.pending_count} request${
                          si.pending_count > 1 ? "s" : ""
                        } pending`
                      : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    className={`wb-btn ${
                      si.pending_count > 0
                        ? "wb-btn-disabled"
                        : "wb-btn-primary"
                    }`}
                    disabled={si.pending_count > 0}
                    onClick={() => openRequestModal(si)}
                  >
                    {si.pending_count > 0 ? "requested" : "request"}
                  </button>

                  {/* {renderRequestButton(si)} */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Modal */}
      {reqModalOpen && reqSlot && (
        <div
          className="wb-modal-overlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains("wb-modal-overlay"))
              setReqModalOpen(false);
          }}
        >
          <div className="wb-modal">
            <div className="wb-modal-head">
              <h3 style={{ margin: 0 }}>Request slot</h3>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>
                  {new Date(reqSlot.start_ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  —{" "}
                  {new Date(reqSlot.end_ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </div>

              <form onSubmit={submitRequest}>
                <div>
                  <textarea
                    placeholder="Optional message to the professor (why you want the slot / quick intro)"
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="submit"
                    className="wb-btn wb-btn-primary"
                    disabled={requesting}
                  >
                    {requesting ? "Sending..." : "Confirm"}
                  </button>
                  <button
                    type="button"
                    className="wb-btn"
                    onClick={() => setReqModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
