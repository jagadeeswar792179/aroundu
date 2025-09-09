// RequestList.jsx
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ExploreLoading1 from "../Loading/explore-loading-1";

/**
 * RequestList (self-contained)
 *
 * Props:
 *  - initialLimit (number) default 5 (initial page size)
 *  - nextLimit (number) default 6 (subsequent page size)
 *  - onChange(requesterId, newStatus) optional callback fired when request is accepted/rejected
 */
export default function RequestList({
  initialLimit = 5,
  nextLimit = 6,
  onChange = () => {},
}) {
  const server = "https://aroundubackend.onrender.com";
  const [requests, setRequests] = useState([]); // array of request rows
  const [cursor, setCursor] = useState(null); // { last_created_at, last_id }
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // map requestId -> boolean
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // reuse same token key as your ProfessorsSection
  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // fetch initial (limit = initialLimit) or subsequent (limit = nextLimit with cursor)
  const fetchPage = useCallback(
    async ({
      initial = false,
      last_created_at = null,
      last_id = null,
    } = {}) => {
      setError(null);
      setLoading(true);
      const params = initial
        ? { limit: initialLimit }
        : { limit: nextLimit, last_created_at, last_id };

      try {
        const res = await axios.get(`${server}/api/follow/pending`, {
          params,
          headers: authHeaders(),
        });

        const items = Array.isArray(res.data.items) ? res.data.items : [];
        const next_cursor = res.data.next_cursor || null;

        if (initial) {
          setRequests(items);
        } else {
          setRequests((prev) => {
            // avoid duplicates just in case
            const ids = new Set(prev.map((r) => r.id));
            const unique = items.filter((r) => !ids.has(r.id));
            return [...prev, ...unique];
          });
        }

        setCursor(next_cursor);
        setHasMore(!!next_cursor);
      } catch (err) {
        console.error(
          "Failed to fetch requests",
          err?.response?.data || err.message || err
        );
        if (err.response && err.response.status === 401) {
          setError("Not authenticated. Please log in.");
        } else {
          setError("Failed to load requests.");
        }
      } finally {
        setLoading(false);
      }
    },
    [authHeaders, initialLimit, nextLimit]
  );

  // initial load
  useEffect(() => {
    fetchPage({ initial: true });
  }, [fetchPage]);

  const handleShowMore = useCallback(() => {
    if (!hasMore || loading) return;
    if (!cursor) return; // no cursor means no more
    fetchPage({
      initial: false,
      last_created_at: cursor.last_created_at,
      last_id: cursor.last_id,
    });
  }, [hasMore, loading, cursor, fetchPage]);

  // optimistic accept
  const acceptRequest = useCallback(
    async (reqRow) => {
      const reqId = reqRow.id;
      if (!reqId || actionLoading[reqId]) return;

      // optimistic remove
      const prior = requests;
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      setActionLoading((m) => ({ ...m, [reqId]: true }));

      try {
        const headers = authHeaders();
        await axios.post(
          `${server}/api/follow/${reqRow.requester_id}/accept`,
          {},
          { headers }
        );

        onChange(reqRow.requester_id, "accepted");
      } catch (err) {
        console.error(
          "Accept failed",
          err?.response?.data || err.message || err
        );
        setError("Failed to accept request.");
        // revert
        setRequests(prior);
      } finally {
        setActionLoading((m) => {
          const c = { ...m };
          delete c[reqId];
          return c;
        });
      }
    },
    [requests, actionLoading, authHeaders, onChange]
  );

  // optimistic reject
  const rejectRequest = useCallback(
    async (reqRow) => {
      const reqId = reqRow.id;
      if (!reqId || actionLoading[reqId]) return;

      const prior = requests;
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      setActionLoading((m) => ({ ...m, [reqId]: true }));

      try {
        const headers = authHeaders();
        await axios.post(
          `${server}/api/follow/${reqRow.requester_id}/reject`,
          {},
          { headers }
        );

        onChange(reqRow.requester_id, "rejected");
      } catch (err) {
        console.error(
          "Reject failed",
          err?.response?.data || err.message || err
        );
        setError("Failed to reject request.");
        // revert
        setRequests(prior);
      } finally {
        setActionLoading((m) => {
          const c = { ...m };
          delete c[reqId];
          return c;
        });
      }
    },
    [requests, actionLoading, authHeaders, onChange]
  );

  const formatTime = useCallback((ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }, []);

  return (
    <div className="request-list">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Friend requests</h3>
      </div>

      {error && <div style={{ color: "#b00020", marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12 }}>
        {requests.length === 0 && !loading && (
          <div style={{ color: "#666" }}>No pending requests.</div>
        )}

        {requests.map((r) => (
          <div
            key={r.id}
            className="load-2"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 8px",
              borderBottom: "1px solid #eee",
            }}
            aria-label={`request-${r.requester_id}`}
          >
            <img
              src={r.avatar_url || "/avatar.jpg"}
              alt={`${r.first_name || ""} avatar`}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 600 }}>
                {r.first_name || "Unknown"} {r.last_name || ""}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {formatTime(r.created_at)}
              </div>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                flexDirection: "column",
              }}
            >
              <button
                onClick={() => acceptRequest(r)}
                disabled={!!actionLoading[r.id]}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  cursor: actionLoading[r.id] ? "not-allowed" : "pointer",
                  background: "#f0fff0",
                  minWidth: 80,
                }}
              >
                {actionLoading[r.id] ? "..." : "Accept"}
              </button>

              <button
                onClick={() => rejectRequest(r)}
                disabled={!!actionLoading[r.id]}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  cursor: actionLoading[r.id] ? "not-allowed" : "pointer",
                  background: "#fff0f0",
                  minWidth: 80,
                }}
              >
                {actionLoading[r.id] ? "..." : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <ExploreLoading1 count={3} />}

      <div style={{ textAlign: "center", marginTop: 12 }}>
        {!loading && hasMore && (
          <button
            onClick={handleShowMore}
            disabled={loading}
            className="show-more-btn"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              border: "1px solid #ccc",
            }}
          >
            Show more
          </button>
        )}

        {!loading && !hasMore && requests.length > 0 && (
          <div style={{ color: "#777", marginTop: 8 }}>No more requests</div>
        )}
      </div>
    </div>
  );
}
