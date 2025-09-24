// src/pages/SearchPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Homepage/Navbar";
import Feed from "../Homepage/feed"; // your feed component (from feed.js)
import "./search.css";
import { FaBookmark, FaChevronDown } from "react-icons/fa";
import SearchLoadingPeople from "../Loading/search-loading-people";
import MessageModal from "../messgaes/MessageModal";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const server = process.env.REACT_APP_SERVER;
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [selectedPeer, setSelectedPeer] = useState(null);

  const queryParams = useQuery();
  const navigate = useNavigate();
  const q = queryParams.get("q") || "";

  const [type, setType] = useState(() => {
    return (queryParams.get("type") || "students").toLowerCase();
  });

  // students/professors state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasMore, setUsersHasMore] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // reset when q or type changes
  useEffect(() => {
    setUsers([]);
    setUsersPage(1);
    setUsersHasMore(true);
    if (type !== "posts") fetchUsers(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  // fetch users (students/professors)
  const fetchUsers = useCallback(
    async (page = 1, replace = false) => {
      if (!q || q.trim() === "") {
        setUsers([]);
        setUsersHasMore(false);
        return;
      }
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          type === "students"
            ? `${server}/api/search/students`
            : `${server}/api/search/professors`;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: q, page },
        });
        const newResults = res.data.results || [];
        setUsers((prev) => (replace ? newResults : [...prev, ...newResults]));
        setUsersHasMore(newResults.length === 10);
        setUsersPage(page + 1);
      } catch (err) {
        console.error("Search users failed", err);
        setUsersHasMore(false);
      } finally {
        setLoadingUsers(false);
      }
    },
    [q, type]
  );

  const switchType = (newType) => {
    setType(newType);
    const params = new URLSearchParams(window.location.search);
    params.set("type", newType);
    navigate(`/search?${params.toString()}`, { replace: true });
  };
  const newsArray = [
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
    "More recruiters get AI savvy; 5h ago • 3,599 readers",
    "What's shaping IT deals; 5h ago • 3,294 readers",
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
    "More recruiters get AI savvy; 5h ago • 3,599 readers",
    "What's shaping IT deals; 5h ago • 3,294 readers",
    "India, Canada reset diplomatic ties; 10m ago",
    "More Indians invest in mutual funds; 10m ago",
    "Big Four goes big on hiring; 5h ago • 4,851 readers",
  ];
  return (
    <>
      {selectedPeer && (
        <MessageModal
          isOpen={!!selectedPeer}
          onClose={() => setSelectedPeer(null)}
          peer={selectedPeer}
        />
      )}
      <div className="container-1">
        <Navbar />
      </div>

      <div className="search-cont-2">
        <div className="search-page">
          <p className="search-heading">Search results for "{q}"</p>

          <div className="search-tabs">
            <button
              onClick={() => switchType("students")}
              className={`search-btn-category ${
                type === "students" ? "clicked-active" : ""
              }`}
            >
              Students
            </button>
            <button
              onClick={() => switchType("professors")}
              className={`search-btn-category ${
                type === "professors" ? "clicked-active" : ""
              }`}
            >
              Professors
            </button>
            <button
              onClick={() => switchType("posts")}
              className={`search-btn-category ${
                type === "posts" ? "clicked-active" : ""
              }`}
            >
              Posts
            </button>
          </div>

          <div className="search-results">
            {type === "posts" ? (
              <Feed
                key={`posts-${q}`}
                fetchUrlBuilder={(page) => ({
                  url: `${server}/api/search/posts`,
                  params: { q: q, page },
                })}
                onNavigateProfile={(userId) => navigate(`/profile/${userId}`)}
                onTagNavigate={(tag) => {
                  navigate(`/search?q=${encodeURIComponent(tag)}&type=posts`);
                }}
                autoFetchOnMount={true}
              />
            ) : (
              <>
                <div className="search-res-people">
                  {users.map((u) => (
                    <div key={u.id} className="result-card">
                      <img
                        src={u.avatar_url || "/avatar.jpg"}
                        alt="profile"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div className="result-card-body">
                        <div
                          style={{ fontWeight: 700, cursor: "pointer" }}
                          onClick={() => {
                            if (u.id !== loggedInUserId) {
                              navigate(`/profile/${u.id}`);
                            }
                          }}
                        >
                          {u.first_name} {u.last_name}
                        </div>
                        <div style={{ color: "#555" }}>
                          {type === "students" ? u.course : u.specialization}
                        </div>
                        <div style={{ color: "#888", fontSize: 13 }}>
                          {u.university}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedPeer({ ...u, profile: u.avatar_url })
                        }
                        className="form-button"
                        style={{ width: "fit-content" }}
                      >
                        Message
                      </button>
                    </div>
                  ))}
                  {users.length === 0 && !loadingUsers && (
                    <div style={{ color: "#777" }}>No results found.</div>
                  )}
                </div>

                {usersHasMore && (
                  <>
                    <SearchLoadingPeople />
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                      <button
                        onClick={() => fetchUsers(usersPage, false)}
                        className="show-more-btn"
                      >
                        {loadingUsers ? "Loading..." : "Show More"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="homecontainer-3">
          <div className="homecontainer-3-1">
            <h3>AroundU News</h3>
            <h4>Top-stories</h4>
            {newsArray.map((item, index) => {
              const [title, details] = item.split(";");
              return (
                <div key={index} className="news-item">
                  <h5>{title.trim()}</h5>
                  <p>{details.trim()}</p>
                </div>
              );
            })}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaChevronDown title="search" size={14} className="icon" />
              Show more
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
