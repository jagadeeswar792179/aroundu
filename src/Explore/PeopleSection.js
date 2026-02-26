import React, { useState, useCallback } from "react";
import axios from "axios";
import ExploreLoading1 from "../Loading/explore-loading-1";
import MessageModal from "../messgaes/MessageModal";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";

/* ---------------- FETCH FUNCTION OUTSIDE COMPONENT ---------------- */

const fetchPeople = async ({ pageParam = 1, sameUniversity }) => {
  const token = localStorage.getItem("token");
  const server = process.env.REACT_APP_SERVER;

  const res = await axios.get(`${server}/api/explore/people`, {
    params: {
      page: pageParam,
      same_university: sameUniversity ? "true" : "false",
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

/* ---------------- COMPONENT ---------------- */

function PeopleSection({ initialSameUniversity = true }) {
  const loggedInUserId =
    JSON.parse(localStorage.getItem("user"))?.id;

  const [sameUniversity, setSameUniversity] = useState(
    initialSameUniversity
  );
  const [selectedPeer, setSelectedPeer] = useState(null);

  const navigate = useNavigate();

  const profileImage = useCallback(
    (url) => url || "/avatar.jpg",
    []
  );

  /* ---------------- REACT QUERY ---------------- */

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["explore-people", sameUniversity],
    queryFn: ({ pageParam = 1 }) =>
      fetchPeople({ pageParam, sameUniversity }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30,  // cache 30 minutes
    keepPreviousData: true,
  });

  /* ---------------- FLATTEN DATA ---------------- */

  const people =
    data?.pages?.flatMap((page) => page.people) ?? [];

  /* ---------------- UI ---------------- */

  return (
    <div
      className="explore-2-2"
      style={{ padding: 12, marginTop: 16 }}
    >
      {selectedPeer && (
        <MessageModal
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          People you may know
        </h3>

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
              onChange={(e) =>
                setSameUniversity(e.target.checked)
              }
            />
            <span className="slider" />
          </div>
          University
        </label>
      </div>

      {/* Grid */}
      <div style={{ marginTop: 8 }}>
        {people.length === 0 && !isLoading && (
          <div style={{ color: "black" }}>
            No suggestions yet.
          </div>
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
                        if (p.id !== loggedInUserId) {
                          navigate(`/profile/${p.id}`);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {p.first_name} {p.last_name}
                    </div>
                  </div>

                  <div className="prof-meta">
                    <div className="prof-role">
                      {p.specialization ||
                        p.course ||
                        ""}
                    </div>
                    <div className="prof-univ">
                      {p.university || ""}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPeer(p)}
                    className="form-button"
                    style={{ width: "fit-content" }}
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Initial Loading */}
      {isLoading && <ExploreLoading1 count={4} />}

      {/* Show More */}
      <div className="showmore-btn-container flex-c">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="show-more-btn"
          >
            {isFetchingNextPage
              ? "Loading..."
              : "<< Show more"}
          </button>
        )}
      </div>
    </div>
  );
}

export default PeopleSection;