// WeekBookings.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./weekbookings.css";
import MessageModal from "../messgaes/MessageModal";
import { BeatLoader } from "react-spinners";
import { MoonLoader } from "react-spinners";
import { MdDelete } from "react-icons/md";
/**
 Props:
  - profileOwnerId (string | null) : id of profile being viewed (if null, component will try to use logged-in user id)
 Behavior:
  - if loggedInUserId === profileOwnerId -> fetch mine=true
  - else -> fetch professorId=profileOwnerId
*/

const PAGE_SIZE = 10;
const server = process.env.REACT_APP_SERVER; // adjust if backend is on another origin

/* ---------- helpers ---------- */
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
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
function timeToMinutes(t) {
  if (!t) return null;
  if (typeof t === "string" && t.includes("T")) {
    const d = new Date(t);
    if (isNaN(d.getTime())) return null;
    return d.getHours() * 60 + d.getMinutes();
  }
  const parts = String(t).split(":");
  if (parts.length < 2) return null;
  const hh = parseInt(parts[0], 10),
    mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}
function timesOverlapMinutes(aStart, aEnd, bStart, bEnd) {
  if (aStart == null || aEnd == null || bStart == null || bEnd == null)
    return false;
  return !(aEnd <= bStart || bEnd <= aStart);
}

/* ---------- Component ---------- */
export default function WeekBookings({ profileOwnerId = null }) {
  const today = new Date();
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const todayIso = formatDateISO(today);

  const weekStart = useMemo(() => startOfWeek(today, 1), []);
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [selectedDayIso, setSelectedDayIso] = useState(todayIso);
  const [instances, setInstances] = useState({}); // map date -> instances array
  const [loadingDay, setLoadingDay] = useState(false);

  // Add-slot modal state (single slot)
  const [modalOpen, setModalOpen] = useState(false);
  const [slot, setSlot] = useState({ start: "09:00", end: "09:30" });
  const [saving, setSaving] = useState(false);

  // Requests modal state
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [currentInstanceForRequests, setCurrentInstanceForRequests] =
    useState(null);
  const [requestsList, setRequestsList] = useState([]);
  const [requestsPage, setRequestsPage] = useState(0);
  const [requestsHasMore, setRequestsHasMore] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsSearch, setRequestsSearch] = useState("");
  const requestsContainerRef = useRef(null);
  const requestsDebounceRef = useRef(null);
  const requestsAbortCtrlRef = useRef(null);
  const [selectedPeer, setSelectedPeer] = useState(null);

  /* ---------- utility: logged in user id ---------- */
  function getLoggedInUserId() {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.id || null;
    } catch (e) {
      return null;
    }
  }

  /* ---------- fetchDay: decides mine vs professorId using only id ---------- */
  async function fetchDay(dateIso, opts = {}) {
    // opts.profileOwnerId can override prop
    const profileId = opts.profileOwnerId ?? profileOwnerId ?? null;
    const loggedInUserId = getLoggedInUserId();

    setLoadingDay(true);
    try {
      const q = new URLSearchParams();
      q.set("date", dateIso);

      if (
        loggedInUserId &&
        profileId &&
        String(loggedInUserId) === String(profileId)
      ) {
        q.set("mine", "true");
      } else if (profileId) {
        q.set("professorId", profileId);
      } else if (loggedInUserId) {
        // no profileOwnerId provided, assume dashboard -> fetch own slots
        q.set("mine", "true");
      } else {
        // nothing sensible to fetch
        setInstances((prev) => ({ ...prev, [dateIso]: [] }));
        setLoadingDay(false);
        return;
      }

      const url = `${server}/api/slot-instances?${q.toString()}`;
      const res = await fetch(url, { headers: authHeaders() });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      if (!contentType.includes("application/json")) {
        const txt = await res.text().catch(() => "");
        throw new Error("Expected JSON, got: " + txt.slice(0, 300));
      }
      const body = await res.json();
      const arr = Array.isArray(body.instances)
        ? body.instances
        : Array.isArray(body)
        ? body
        : [];
      setInstances((prev) => ({ ...prev, [dateIso]: arr }));
    } catch (err) {
      console.error("fetchDay error", err);
      setInstances((prev) => ({ ...prev, [dateIso]: [] }));
    } finally {
      setLoadingDay(false);
    }
  }

  // initial fetch for today
  useEffect(() => {
    fetchDay(todayIso);
    // eslint-disable-next-line
  }, []); // run once on mount

  // click day -> select + fetch that day
  function onSelectDay(iso) {
    setSelectedDayIso(iso);
    fetchDay(iso);
  }

  /* ---------- Add-slot modal helpers ---------- */
  function openModalForSelectedDay() {
    setSlot({ start: "09:00", end: "09:30" });
    setModalOpen(true);
  }

  function validateSlotSingle() {
    const { start, end } = slot;
    if (!start || !end) return { ok: false, msg: "Start & end required" };
    const sMin = timeToMinutes(start),
      eMin = timeToMinutes(end);
    if (sMin == null || eMin == null) return { ok: false, msg: "Invalid time" };
    if (sMin >= eMin) return { ok: false, msg: "Start must be before end" };
    const existing = instances[selectedDayIso] || [];
    for (const ex of existing) {
      const exS = timeToMinutes(ex.start_ts || ex.start || "");
      const exE = timeToMinutes(ex.end_ts || ex.end || "");
      if (exS == null || exE == null) continue;
      if (timesOverlapMinutes(sMin, eMin, exS, exE)) {
        const exStartStr = new Date(ex.start_ts).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const exEndStr = new Date(ex.end_ts).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return { ok: false, msg: `Overlaps ${exStartStr} - ${exEndStr}` };
      }
    }
    return { ok: true };
  }

  async function onConfirmAdd(ev) {
    ev.preventDefault();
    if (selectedDayIso < todayIso)
      return alert("Cannot add free times for past days.");
    const v = validateSlotSingle();
    if (!v.ok) return alert(v.msg);
    setSaving(true);
    try {
      // ... inside onConfirmAdd:
      const date = selectedDayIso;
      const [yy, mm, dd] = date.split("-").map(Number);
      const [sh, sm] = slot.start.split(":").map(Number);
      const [eh, em] = slot.end.split(":").map(Number);

      const startLocal = new Date(yy, mm - 1, dd, sh, sm, 0);
      const endLocal = new Date(yy, mm - 1, dd, eh, em, 0);

      const start_ts = startLocal.toISOString();
      const end_ts = endLocal.toISOString();

      const res = await fetch(`${server}/api/slot-instances/batch`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          date,
          ranges: [{ start_ts, end_ts, capacity: 0, notes: null }],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Create failed");
      }
      await fetchDay(date);
      setModalOpen(false);
    } catch (err) {
      console.error("onConfirmAdd error", err);
      alert("Failed to create slot: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete instance ---------- */
  async function removeInstance(id) {
    if (!window.confirm("Delete this slot instance?")) return;
    try {
      const res = await fetch(`${server}/api/slot-instances/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Delete failed");
      }
      await fetchDay(selectedDayIso);
    } catch (err) {
      console.error("removeInstance error", err);
      alert("Delete failed: " + (err.message || err));
    }
  }

  /* ---------- Requests modal: pagination, search, infinite scroll ---------- */

  // open modal for instance
  // open modal for a specific slot instance (no immediate UI clearing)
  async function openRequestsModal(instanceId) {
    // keep existing requests visible while we fetch new ones to avoid flicker.
    // If you prefer to clear search when opening, uncomment the next line:
    // setRequestsSearch("");

    setRequestsPage(0);
    setRequestsHasMore(true);
    setRequestsTotal(0);

    setCurrentInstanceForRequests(instanceId);
    setReqModalOpen(true);

    // Immediately fetch first page and pass instanceId directly (avoid race with state)
    await fetchRequestsPage(0, instanceId, requestsSearch || "");
  }

  // fetch page (race-safe, non-flickering)
  const requestsInflightKeyRef = React.useRef(0);

  async function fetchRequestsPage(page, instanceId, search) {
    if (requestsLoading) return;
    setRequestsLoading(true);

    // increment inflight key so old responses can be ignored
    const myKey = ++requestsInflightKeyRef.current;

    // abort previous fetch if any
    if (requestsAbortCtrlRef.current) {
      try {
        requestsAbortCtrlRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    requestsAbortCtrlRef.current = controller;

    try {
      const offset = page * PAGE_SIZE;
      const q = new URLSearchParams();
      q.set("status", "pending");
      q.set("limit", String(PAGE_SIZE));
      q.set("offset", String(offset));
      if (search) q.set("search", search);
      if (instanceId) q.set("slotInstanceId", instanceId);

      const url = `${server}/api/requests?${q.toString()}`;
      const res = await fetch(url, {
        headers: authHeaders(),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to fetch requests");
      }
      const body = await res.json();
      const pageRows = body.requests || [];
      const total = body.total || 0;

      // If another newer fetch was started after us, ignore this response
      if (myKey !== requestsInflightKeyRef.current) {
        // ignore stale response
        return;
      }

      // On first page we replace, on later pages we append
      setRequestsList((prev) =>
        page === 0 ? pageRows : [...prev, ...pageRows]
      );
      setRequestsPage(page);
      setRequestsTotal(total);
      setRequestsHasMore((page + 1) * PAGE_SIZE < total);
    } catch (err) {
      if (err.name === "AbortError") {
        // ignore aborted fetch
      } else {
        console.error("fetchRequestsPage error", err);
        // don't clear previous results on error — just show message
        alert("Failed to load requests");
      }
    } finally {
      // only clear loading if this is still the active fetch
      if (myKey === requestsInflightKeyRef.current) {
        setRequestsLoading(false);
        requestsAbortCtrlRef.current = null;
      }
    }
  }

  // close requests modal
  function closeRequestsModal() {
    setReqModalOpen(false);
    setRequestsList([]);
    setCurrentInstanceForRequests(null);

    // abort any in-flight fetch
    if (requestsAbortCtrlRef.current) {
      try {
        requestsAbortCtrlRef.current.abort();
      } catch (e) {}
      requestsAbortCtrlRef.current = null;
    }
    // clear debounce
    if (requestsDebounceRef.current) {
      clearTimeout(requestsDebounceRef.current);
      requestsDebounceRef.current = null;
    }
  }

  // handle infinite scroll
  function onRequestsScroll(e) {
    const el = e.target;
    if (!requestsHasMore || requestsLoading) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;
    if (nearBottom) {
      fetchRequestsPage(
        requestsPage + 1,
        currentInstanceForRequests,
        requestsSearch
      );
    }
  }

  // debounce search -> server-side query; resets to first page on search
  // debounce search -> server-side query; resets to first page on search
  useEffect(() => {
    // only react to actual search text changes (not modal open/instance changes)
    if (!reqModalOpen) return; // require modal open
    if (!currentInstanceForRequests) return; // require instance selected

    // clear previous timer
    if (requestsDebounceRef.current) clearTimeout(requestsDebounceRef.current);

    // set new debounce to handle search typing
    requestsDebounceRef.current = setTimeout(() => {
      // cancel any in-flight fetch before starting new search
      if (requestsAbortCtrlRef.current) {
        try {
          requestsAbortCtrlRef.current.abort();
        } catch (e) {}
        requestsAbortCtrlRef.current = null;
      }

      // reset and fetch first page with new search term
      // We purposely do NOT call setRequestsList([]) here if you want to keep previous results
      // visible while searching; but if you prefer immediate clearing, uncomment next line:
      // setRequestsList([]);

      setRequestsPage(0);
      setRequestsHasMore(true);
      fetchRequestsPage(0, currentInstanceForRequests, requestsSearch);
    }, 350);

    return () => {
      if (requestsDebounceRef.current) {
        clearTimeout(requestsDebounceRef.current);
        requestsDebounceRef.current = null;
      }
    };
    // only re-run when the search term changes
  }, [requestsSearch]); // <-- IMPORTANT change: only depend on requestsSearch

  // accept request
  async function acceptRequest(requestId) {
    if (!window.confirm("Accept this request?")) return;
    try {
      const res = await fetch(`${server}/api/requests/${requestId}/accept`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Accept failed");
      }
      // remove from list locally and refresh day counts
      setRequestsList((prev) => prev.filter((r) => r.id !== requestId));
      setRequestsTotal((t) => Math.max(0, t - 1));
      await fetchDay(selectedDayIso);
    } catch (err) {
      console.error("acceptRequest error", err);
      alert("Accept failed: " + (err.message || err));
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="wb-root">
      {/* DAYS */}
      {selectedPeer && (
        <MessageModal
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}
      <div className="wb-days">
        {days.map((d) => {
          const iso = formatDateISO(d);
          const isPast = iso < todayIso;
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
            </div>
          );
        })}
      </div>
      {/* RIGHT PANEL */}
      <div className="wb-panel">
        <div className="wb-panel-header">
          <h3 className="wb-panel-title">Free times for {selectedDayIso}</h3>

          {selectedDayIso >= todayIso ? (
            <button
              className="wb-btn wb-btn-primary"
              onClick={openModalForSelectedDay}
            >
              Add free time
            </button>
          ) : (
            <div className="wb-past-note">Past day — read-only</div>
          )}
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
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {selectedDayIso >= todayIso ? (
                    <MdDelete
                      className="wb-btn-ghost"
                      onClick={() => removeInstance(si.id)}
                    />
                  ) : (
                    // <button
                    //   className="wb-btn-ghost"
                    //   onClick={() => removeInstance(si.id)}
                    // >
                    //   Delete
                    // </button>
                    <div className="wb-prev-note">previous slot</div>
                  )}

                  <button
                    className="wb-btn"
                    onClick={() => openRequestsModal(si.id)}
                  >
                    view all Requests ({si.pending_count || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* ADD SLOT MODAL */}
      {modalOpen && (
        <div
          className="wb-modal-overlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains("wb-modal-overlay"))
              setModalOpen(false);
          }}
        >
          <div className="wb-modal">
            <div className="wb-modal-head">
              <h3 style={{ margin: 0 }}>Add free time for {selectedDayIso}</h3>
            </div>
            <form className="wb-modal-form" onSubmit={onConfirmAdd}>
              <div className="wb-time-row">
                <label className="wb-time-label">
                  <span className="wb-time-caption">Start</span>
                  <input
                    className="wb-time-input"
                    type="time"
                    required
                    value={slot.start}
                    onChange={(e) =>
                      setSlot((s) => ({ ...s, start: e.target.value }))
                    }
                  />
                </label>

                <label className="wb-time-label">
                  <span className="wb-time-caption">End</span>
                  <input
                    className="wb-time-input"
                    type="time"
                    required
                    value={slot.end}
                    onChange={(e) =>
                      setSlot((s) => ({ ...s, end: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="wb-modal-footer">
                <button
                  className="wb-btn wb-btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {!saving ? "confirm" : <BeatLoader size={10} />}
                </button>
                <button
                  className="wb-btn"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REQUESTS MODAL */}
      {reqModalOpen && (
        <div
          className="wb-modal-overlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains("wb-modal-overlay"))
              closeRequestsModal();
          }}
        >
          <div
            className="wb-modal wb-modal--wide"
            role="dialog"
            aria-modal="true"
          >
            <div className="wb-modal-header">
              <div className="wb-modal-title-group">
                <h3 className="wb-modal-title">Requests for this slot</h3>
                <div className="wb-modal-sub">{requestsTotal} total</div>
              </div>
              <button
                className="wb-modal-close"
                aria-label="Close"
                onClick={closeRequestsModal}
              >
                ✕
              </button>
            </div>

            <div className="wb-modal-search">
              <input
                placeholder="Search name / university / course"
                value={requestsSearch}
                onChange={(e) => setRequestsSearch(e.target.value)}
                className="wb-input"
              />
            </div>

            <div
              ref={requestsContainerRef}
              onScroll={onRequestsScroll}
              className="wb-requests-body"
            >
              {requestsList.length === 0 && !requestsLoading && (
                <div className="wb-requests-empty">No requests.</div>
              )}

              {requestsList.map((r) => (
                <div key={r.id} className="wb-request-row">
                  <img
                    src={r.profile_presigned || "/default-avatar.png"}
                    alt="avatar"
                    className="wb-request-avatar"
                  />
                  <div className="wb-request-main">
                    <div className="wb-request-name">
                      {r.first_name} {r.last_name}
                    </div>
                    <div className="wb-request-meta">
                      {r.university || "—"} · {r.course || "—"}
                    </div>
                    {/* {r.requester_message && (
                      <div className="wb-request-message">
                        {r.requester_message}
                      </div>
                    )} */}
                  </div>

                  <div className="wb-request-actions">
                    {/* <button
                      className="wb-btn wb-btn-primary wb-request-accept"
                      onClick={() => acceptRequest(r.id)}
                    >
                      Accept
                    </button> */}
                    <button
                      onClick={() =>
                        setSelectedPeer({
                          ...r,
                          id: r.requester_id,
                          profile: r.profile_presigned,
                        })
                      }
                      className="form-button"
                      style={{ width: "fit-content" }}
                    >
                      Message
                    </button>
                    <div className="wb-request-time">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {requestsLoading && (
                <div className="wb-requests-loading">Loading...</div>
              )}
              {!requestsHasMore && requestsList.length > 0 && (
                <div className="wb-requests-end">End of results</div>
              )}
            </div>

            <div className="wb-modal-footer">
              <button className="wb-btn" onClick={closeRequestsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
