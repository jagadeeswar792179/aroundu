import React, { useEffect, useMemo, useRef, useState } from "react";

import "./modalcss/PreviousSlotModal.css";

import { FiX } from "react-icons/fi";

import { MdDelete } from "react-icons/md";

const PAGE_SIZE = 10;

const server = process.env.REACT_APP_SERVER;

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
  });
}

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
};

export default function PreviousSlotModal({ close }) {
  const today = new Date();

  const todayIso = formatDateISO(today);

  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const start = startOfWeek(today, 1);

    start.setDate(start.getDate() + weekOffset * 7);

    return start;
  }, [weekOffset]);

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const [selectedDayIso, setSelectedDayIso] = useState(null);

  const [instances, setInstances] = useState({});

  const [loadingDay, setLoadingDay] = useState(false);

  // REQUEST MODAL
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

  async function fetchDay(dateIso) {
    setLoadingDay(true);

    try {
      const q = new URLSearchParams();

      q.set("date", dateIso);

      const res = await fetch(`${server}/api/previous-slots?${q.toString()}`, {
        headers: authHeaders(),
      });

      const body = await res.json();

      setInstances((prev) => ({
        ...prev,
        [dateIso]: body.instances || [],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDay(false);
    }
  }

  useEffect(() => {
    if (!selectedDayIso) return;

    fetchDay(selectedDayIso);
  }, [selectedDayIso]);

  async function removeInstance(id) {
    if (!window.confirm("Delete this slot instance?")) return;

    try {
      const res = await fetch(`${server}/api/slot-instances/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      fetchDay(selectedDayIso);
    } catch (err) {
      console.error(err);

      alert(err.message);
    }
  }

  async function openRequestsModal(instanceId) {
    setRequestsPage(0);

    setRequestsHasMore(true);

    setRequestsTotal(0);

    setCurrentInstanceForRequests(instanceId);

    setReqModalOpen(true);

    await fetchRequestsPage(0, instanceId, requestsSearch || "");
  }

  const requestsInflightKeyRef = React.useRef(0);

  async function fetchRequestsPage(page, instanceId, search) {
    if (requestsLoading) return;

    setRequestsLoading(true);

    const myKey = ++requestsInflightKeyRef.current;

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

      q.set("limit", String(PAGE_SIZE));

      q.set("offset", String(offset));

      if (search) q.set("search", search);

      if (instanceId) {
        q.set("slotInstanceId", instanceId);
      }

      const url = `${server}/api/requests?${q.toString()}`;

      const res = await fetch(url, {
        headers: authHeaders(),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }

      const body = await res.json();

      const pageRows = body.requests || [];

      const total = body.total || 0;

      if (myKey !== requestsInflightKeyRef.current) {
        return;
      }

      setRequestsList((prev) =>
        page === 0 ? pageRows : [...prev, ...pageRows],
      );

      setRequestsPage(page);

      setRequestsTotal(total);

      setRequestsHasMore((page + 1) * PAGE_SIZE < total);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      if (myKey === requestsInflightKeyRef.current) {
        setRequestsLoading(false);

        requestsAbortCtrlRef.current = null;
      }
    }
  }

  function closeRequestsModal() {
    setReqModalOpen(false);

    setRequestsList([]);

    setCurrentInstanceForRequests(null);

    if (requestsAbortCtrlRef.current) {
      try {
        requestsAbortCtrlRef.current.abort();
      } catch (e) {}

      requestsAbortCtrlRef.current = null;
    }

    if (requestsDebounceRef.current) {
      clearTimeout(requestsDebounceRef.current);

      requestsDebounceRef.current = null;
    }
  }

  function onRequestsScroll(e) {
    const el = e.target;

    if (!requestsHasMore || requestsLoading) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 180;

    if (nearBottom) {
      fetchRequestsPage(
        requestsPage + 1,
        currentInstanceForRequests,
        requestsSearch,
      );
    }
  }

  useEffect(() => {
    if (!reqModalOpen) return;

    if (!currentInstanceForRequests) return;

    if (requestsDebounceRef.current) {
      clearTimeout(requestsDebounceRef.current);
    }

    requestsDebounceRef.current = setTimeout(() => {
      if (requestsAbortCtrlRef.current) {
        try {
          requestsAbortCtrlRef.current.abort();
        } catch (e) {}

        requestsAbortCtrlRef.current = null;
      }

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
  }, [requestsSearch]);

  return (
    <div className="wb-modal-overlay">
      <div className="wb-modal wb-modal--wide">
        {/* HEADER */}
        <div className="wb-modal-header">
          <h3>Previous Slots</h3>

          <button className="wb-modal-close" onClick={close}>
            <FiX />
          </button>
        </div>
        {/* WEEK NAVIGATION HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <button
            className="wb-btn"
            onClick={() => {
              setWeekOffset((p) => p - 1);

              setSelectedDayIso(null);
            }}
          >
            Previous Week
          </button>

          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {weekStart.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </div>

          <button
            className="wb-btn"
            disabled={weekOffset >= 0}
            onClick={() => {
              setWeekOffset((p) => p + 1);

              setSelectedDayIso(null);
            }}
          >
            Next Week
          </button>
        </div>

        {/* WEEK NAVIGATION */}
        <div className="wb-days">
          {days.map((d) => {
            const iso = formatDateISO(d);

            return (
              <div
                key={iso}
                style={{
                  opacity: iso > todayIso ? 0.5 : 1,
                  pointerEvents: iso > todayIso ? "none" : "auto",
                }}
                className={`wb-day ${
                  iso === selectedDayIso ? "wb-day-selected" : ""
                }`}
                onClick={() => setSelectedDayIso(iso)}
              >
                <div className="wb-day-title">{dayLabel(d)}</div>
              </div>
            );
          })}
        </div>

        {/* SLOT LIST */}
        <div className="wb-panel-body">
          {!selectedDayIso ? (
            <div className="wb-empty">Select a day to view slots.</div>
          ) : loadingDay ? (
            <div>Loading...</div>
          ) : (instances[selectedDayIso] || []).length === 0 ? (
            <div>No previous slots.</div>
          ) : (
            (instances[selectedDayIso] || []).map((si) => (
              <div key={si.id} className="wb-slot-row">
                <div className="wb-slot-time">
                  {new Date(si.start_ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                  {" - "}

                  {new Date(si.end_ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <MdDelete
                    className="wb-btn-ghost"
                    onClick={() => removeInstance(si.id)}
                  />

                  <button
                    className="wb-btn"
                    onClick={() => openRequestsModal(si.id)}
                  >
                    Requests ({si.pending_count || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

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
                        {r.university || ""} {r.course || ""}
                      </div>

                      {r.requester_message && (
                        <div className="wb-request-message">
                          {r.requester_message}
                        </div>
                      )}
                    </div>

                    <div className="wb-request-time">
                      {new Date(r.created_at).toLocaleString()}
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
    </div>
  );
}
