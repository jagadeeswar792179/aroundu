import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import ExploreLoading1 from "../Loading/explore-loading-1";

/**
 * ProfessorsSection (self-contained)
 *
 * Props (all optional):
 *  - initialSameUniversity (bool) default false
 *  - pageSize (number) default 4
 *  - cap (number) max items to fetch (default 20)
 *  - onFollowChange(userId, newStatus) optional callback to notify parent
 */
function ProfessorsSection({
  initialSameUniversity = false,
  pageSize = 4,
  cap = 20,
  onFollowChange = () => {},
}) {
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [sameUniversity, setSameUniversity] = useState(initialSameUniversity);

  const [profs, setProfs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // per-user follow status and loading flags (local)
  const [followStatuses, setFollowStatuses] = useState({}); // id -> 'follow'|'requested'|'friends'
  const [loadingOps, setLoadingOps] = useState({}); // id -> boolean

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const profileImage = useCallback((url) => url || "/avatar.jpg", []);

  // fetch function (page param)
  const fetchPage = useCallback(
    async (pageToFetch = 1, replace = false) => {
      const offset = (pageToFetch - 1) * pageSize;
      if (offset >= cap) {
        setHasMore(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/explore/professors",
          {
            params: {
              page: pageToFetch,
              same_university: sameUniversity ? "true" : "false",
            },
            headers: authHeaders(),
          }
        );

        const got = Array.isArray(res.data.professors)
          ? res.data.professors
          : [];
        const totalMatching = Number(res.data.totalMatching || 0);
        const hasMoreFromServer = !!res.data.hasMore;

        const cappedTotal = Math.min(totalMatching || cap, cap);
        setTotal(cappedTotal);
        setHasMore(hasMoreFromServer && offset + got.length < cappedTotal);

        if (replace) setProfs(got);
        else {
          setProfs((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const unique = got.filter((p) => !ids.has(p.id));
            return [...prev, ...unique];
          });
        }

        // optionally initialize follow statuses if backend returns them in rows
        // e.g., if rows include my_follow_status, map them
        if (got.length) {
          const map = {};
          got.forEach((p) => {
            if (p.my_follow_status)
              map[p.id] =
                p.my_follow_status === "accepted" &&
                p.incoming_follow_status === "accepted"
                  ? "friends"
                  : p.my_follow_status;
          });
          if (Object.keys(map).length) {
            setFollowStatuses((s) => ({ ...map, ...s }));
          }
        }
      } catch (err) {
        console.error(
          "Professors fetch failed",
          err?.response?.data || err.message || err
        );
      } finally {
        setLoading(false);
      }
    },
    [sameUniversity, pageSize, cap, authHeaders]
  );

  // initial load & reload on toggle change
  useEffect(() => {
    setPage(1);
    setProfs([]);
    setHasMore(true);
    fetchPage(1, true);
  }, [sameUniversity, fetchPage]);

  const handleShowMore = useCallback(() => {
    if (!hasMore || loading) return;
    const next = page + 1;
    if ((next - 1) * pageSize >= cap) {
      setHasMore(false);
      return;
    }
    setPage(next);
    fetchPage(next, false);
  }, [hasMore, loading, page, pageSize, cap, fetchPage]);

  // helpers for follow actions
  const sendFollowRequest = useCallback(
    async (targetId) => {
      if (!targetId) return;
      if (loadingOps[targetId]) return;
      // optimistic
      setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
      setLoadingOps((m) => ({ ...m, [targetId]: true }));
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:5000/api/follow/${targetId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const serverStatus = res.data?.status || res.data?.follow_status;
        const newStatus =
          serverStatus === "accepted" || serverStatus === "friends"
            ? "friends"
            : "requested";
        setFollowStatuses((s) => ({ ...s, [targetId]: newStatus }));
        onFollowChange(targetId, newStatus);
      } catch (err) {
        console.error(
          "Send follow failed",
          err?.response?.data || err.message || err
        );
        // rollback
        setFollowStatuses((s) => ({ ...s, [targetId]: "follow" }));
        alert("Could not send follow request");
      } finally {
        setLoadingOps((m) => ({ ...m, [targetId]: false }));
      }
    },
    [loadingOps, onFollowChange]
  );

  const cancelFollowRequest = useCallback(
    async (targetId) => {
      if (!targetId) return;
      if (loadingOps[targetId]) return;
      setLoadingOps((m) => ({ ...m, [targetId]: true }));
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:5000/api/follow/${targetId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowStatuses((s) => ({ ...s, [targetId]: "follow" }));
        onFollowChange(targetId, "follow");
      } catch (err) {
        console.error(
          "Cancel follow failed",
          err?.response?.data || err.message || err
        );
        alert("Could not cancel request");
      } finally {
        setLoadingOps((m) => ({ ...m, [targetId]: false }));
      }
    },
    [loadingOps, onFollowChange]
  );

  const renderFollowStatusDiv = useCallback(
    (authorId) => {
      if (!authorId || authorId === loggedInUserId) return null;
      const status = followStatuses[authorId] || "follow";
      const loadingFlag = !!loadingOps[authorId];

      if (status === "friends") {
        return (
          <div
            style={{
              marginLeft: "auto",
              fontWeight: 600,
              color: "#2e7d32",
              padding: "6px 10px",
            }}
          >
            Friends
          </div>
        );
      }
      if (status === "requested") {
        return (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{ fontWeight: 600, color: "#555", padding: "6px 10px" }}
            >
              Requested
            </div>
            <button
              onClick={() => cancelFollowRequest(authorId)}
              disabled={loadingFlag}
              style={{
                fontSize: 12,
                padding: "4px 8px",
                cursor: loadingFlag ? "not-allowed" : "pointer",
                borderRadius: 6,
              }}
            >
              {loadingFlag ? "..." : "Cancel"}
            </button>
          </div>
        );
      }
      return (
        <div
          role="button"
          onClick={() => sendFollowRequest(authorId)}
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: loadingFlag ? "not-allowed" : "pointer",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
          }}
          aria-disabled={loadingFlag}
        >
          <div style={{ fontWeight: 600, color: "#1976d2" }}>Follow</div>
        </div>
      );
    },
    [
      followStatuses,
      loadingOps,
      loggedInUserId,
      sendFollowRequest,
      cancelFollowRequest,
    ]
  );

  // rendered UI
  return (
    <div className="explore-2-1">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Trending professors</h3>
        <label
          style={{
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={sameUniversity}
              onChange={(e) => setSameUniversity(e.target.checked)}
            />
            <span className="slider" />
          </div>
          Same University
        </label>
      </div>

      <div className="prof-grid" style={{ marginTop: 12 }}>
        {profs.length === 0 && !loading && (
          <div style={{ color: "#777" }}>No professors found.</div>
        )}

        {profs.map((p) => (
          <div
            className="prof-card"
            key={p.id}
            aria-label={`professor-${p.first_name}-${p.last_name}`}
          >
            <div className="prof-card-left">
              <img
                src={profileImage(p.avatar_url)}
                alt={`${p.first_name} ${p.last_name}`}
                className="prof-avatar"
              />
            </div>

            <div className="prof-card-body">
              <div className="prof-top">
                <div className="prof-name">
                  {p.first_name} {p.last_name}
                </div>
              </div>

              <div className="prof-meta">
                <div className="prof-role">
                  {p.specialization || p.course || "—"}
                </div>
                <div className="prof-univ">{p.university || "—"}</div>
              </div>

              <div className="prof-badge">
                {p.followers_count
                  ? `${p.followers_count} Followers`
                  : "0 Followers"}
              </div>
            </div>

            <div className="prof-footer">{renderFollowStatusDiv(p.id)}</div>
          </div>
        ))}
      </div>

      {loading && <ExploreLoading1 count={4} />}

      <div style={{ textAlign: "center", marginTop: 10 }}>
        {!loading && hasMore && (
          <button
            onClick={handleShowMore}
            disabled={loading}
            className="show-more-btn"
          >
            <span style={{ transition: "0.3s" }}>Show more</span>
          </button>
        )}

        {/* {!loading && !hasMore && profs.length > 0 && (
          <div style={{ color: "#777" }}>No more professors.</div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 8, color: "#666" }}>
            Loading…
          </div>
        )} */}
      </div>

      {/* <div className="explore-footer-text" style={{ marginTop: 8 }}>
        Showing {profs.length} of up to {Math.min(total || cap, cap)} professors
      </div> */}
    </div>
  );
}

export default ProfessorsSection;
