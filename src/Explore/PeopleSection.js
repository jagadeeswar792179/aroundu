import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ExploreLoading1 from "../Loading/explore-loading-1";
import MessageModal from "../messgaes/MessageModal";
import { useNavigate } from "react-router-dom";

/**
 * PeopleSection - self-contained "People you may know"
 *
 * Props:
 *  - initialSameUniversity (bool)
 *  - pageSize (number)
 *  - cap (number)
 *  - onFollowChange(userId, newStatus) optional
 */
function PeopleSection({
  initialSameUniversity = true,
  pageSize = 6,
  cap = 30,
  onFollowChange = () => {},
}) {
  const server = process.env.REACT_APP_SERVER;
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [sameUniversity, setSameUniversity] = useState(initialSameUniversity);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [people, setPeople] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [followStatuses, setFollowStatuses] = useState({});
  const [loadingOps, setLoadingOps] = useState({});

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const profileImage = useCallback((url) => url || "/avatar.jpg", []);

  const fetchPage = useCallback(
    async (pageToFetch = 1, replace = false) => {
      const offset = (pageToFetch - 1) * pageSize;
      if (offset >= cap) {
        setHasMore(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${server}/api/explore/people`, {
          params: { page: pageToFetch, same_university: sameUniversity },
          headers: { Authorization: `Bearer ${token}` },
        });

        const got = Array.isArray(res.data.people) ? res.data.people : [];
        const totalMatching = Number(res.data.totalMatching || 0);
        const hasMoreFromServer = !!res.data.hasMore;

        const cappedTotal = Math.min(totalMatching || cap, cap);
        setTotal(cappedTotal);
        setHasMore(hasMoreFromServer && offset + got.length < cappedTotal);

        if (replace) setPeople(got);
        else {
          setPeople((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const unique = got.filter((p) => !ids.has(p.id));
            return [...prev, ...unique];
          });
        }

        // initialize followStatuses if provided in row
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
          if (Object.keys(map).length)
            setFollowStatuses((s) => ({ ...map, ...s }));
        }
      } catch (err) {
        console.error(
          "People fetch failed",
          err?.response?.data || err.message || err
        );
      } finally {
        setLoading(false);
      }
    },
    [sameUniversity, pageSize, cap]
  );

  useEffect(() => {
    setPage(1);
    setPeople([]);
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

  // follow ops
  const sendFollowRequest = useCallback(
    async (targetId) => {
      if (!targetId) return;
      if (loadingOps[targetId]) return;
      setFollowStatuses((s) => ({ ...s, [targetId]: "requested" }));
      setLoadingOps((m) => ({ ...m, [targetId]: true }));
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${server}m/api/follow/${targetId}`,
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
          `${server}/follow/${targetId}/cancel`,
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

  return (
    <div className="explore-2-2" style={{ padding: 12, marginTop: 16 }}>
      {selectedPeer && (
        <MessageModal
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginTop: 0 }}>People you may know</h3>
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
          University
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        {people.length === 0 && !loading && (
          <div style={{ color: "black" }}>No suggestions yet.</div>
        )}

        <div style={{ marginTop: 8 }}>
          <div className="prof-grid">
            {people.map((p) => (
              <div
                className="prof-card"
                key={p.id}
                aria-label={`person-${p.first_name}-${p.last_name}`}
              >
                <div className="prof-card-left">
                  {p.avatar_url ? (
                    <img
                      src={profileImage(p.avatar_url)}
                      alt={`${p.first_name} ${p.last_name}`}
                      className="prof-avatar"
                    />
                  ) : (
                    <div className="explore-fallback flex-r">
                      {`${p.first_name?.[0] || ""}${
                        p.last_name?.[0] || ""
                      }`.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="prof-card-body">
                  <div className="prof-top">
                    <div
                      className="prof-name"
                      onClick={() => {
                        if (p.id !== loggedInUserId)
                          navigate(`/profile/${p.id}`);
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {p.first_name} {p.last_name}
                    </div>
                  </div>

                  <div className="prof-meta">
                    <div className="prof-role">
                      {p.specialization || p.course || ""}
                    </div>
                    <div className="prof-univ">{p.university || ""}</div>
                    {/* <div className="prof-badge">
                      {p.followers_count
                        ? `${p.followers_count} Followers`
                        : "0 Followers"}
                    </div> */}
                  </div>
                  <button
                    onClick={() => setSelectedPeer(p)}
                    className="form-button"
                    style={{ width: "fit-content" }}
                  >
                    Message
                  </button>
                </div>

                {/* <div className="prof-footer">{renderFollowStatusDiv(p.id)}</div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading && <ExploreLoading1 count={4} />}
      <div className="showmore-btn-container flex-c">
        {!loading && hasMore && (
          <button
            onClick={handleShowMore}
            className="show-more-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "<< Show more"}
          </button>
        )}
        {/* {!loading && !hasMore && people.length > 0 && (
          <div style={{ color: "#777" }}>No more suggestions.</div>
        )} */}
        {/* {loading && (
          <div style={{ textAlign: "center", padding: 8, color: "#666" }}>
            Loading…
          </div>
        )} */}
      </div>
    </div>
  );
}

export default PeopleSection;
