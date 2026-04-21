import React, { useState, useCallback } from "react";
import axios from "axios";
import ExploreLoading1 from "../Loading/explore-loading-1";
import MessageModal from "../messgaes/MessageModal";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchClubs = async ({ pageParam = 1, sameUniversity }) => {
  const token = localStorage.getItem("token");
  const server = process.env.REACT_APP_SERVER;

  const res = await axios.get(`${server}/api/explore/clubs`, {
    params: {
      page: pageParam,
      same_university: sameUniversity ? "true" : "false",
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

function ClubsSection({ initialSameUniversity = false }) {
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const [sameUniversity, setSameUniversity] = useState(initialSameUniversity);

  const [selectedPeer, setSelectedPeer] = useState(null);

  const navigate = useNavigate();

  const profileImage = useCallback((url) => url || "/avatar.jpg", []);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["explore-clubs", sameUniversity],
      queryFn: ({ pageParam = 1 }) => fetchClubs({ pageParam, sameUniversity }),
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length + 1 : undefined,
    });

  const clubs = data?.pages?.flatMap((page) => page.clubs) ?? [];

  return (
    <div className="explore-2-1">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Trending clubs</h3>

        <label
          className="toggle-label"
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

      <div className="prof-grid">
        {clubs.map((c) => (
          <div className="prof-card" key={c.id}>
            <div className="prof-card-left">
              {c.avatar_url ? (
                <img
                  src={profileImage(c.avatar_url)}
                  className="prof-avatar"
                  alt="club"
                />
              ) : (
                <div className="explore-fallback">
                  <img src="/avatar.jpg" className="prof-avatar" alt="club" />
                </div>
              )}
            </div>

            <div className="prof-card-body">
              <div className="prof-top">
                <div
                  className="prof-name"
                  onClick={() => {
                    if (c.id !== loggedInUserId) {
                      navigate(`/profile/${c.id}`);
                    }
                  }}
                >
                  {c.first_name}
                </div>
              </div>

              <div className="prof-univ">{c.university || ""}</div>

              <button
                onClick={() => setSelectedPeer(c)}
                className="form-button"
                style={{ width: "fit-content" }}
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {isLoading && <ExploreLoading1 count={4} />}
      <div className="showmore-btn-container flex-c">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="show-more-btn"
          >
            {isFetchingNextPage ? "Loading..." : "<< Show more"}
          </button>
        )}
      </div>
      {selectedPeer && (
        <MessageModal
          isOpen
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}
    </div>
  );
}

export default ClubsSection;
