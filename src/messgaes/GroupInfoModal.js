import { useState, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchUsers } from "../utils/searchUsers";
import { BeatLoader } from "react-spinners";
import InfiniteScroll from "react-infinite-scroll-component";
export default function GroupInfoModal({
  conversationId,
  title,
  close,
  memberCount,
  onUpdated,
  setActive,
}) {
  const searchCache = useRef({});
  const server = process.env.REACT_APP_SERVER;
  const token = localStorage.getItem("token");
  const [removeMode, setRemoveMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [addSelected, setAddSelected] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(memberCount);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["group-members", conversationId, query, page],
    queryFn: async () => {
      const res = await fetch(
        `${server}/api/messages/${conversationId}/members?q=${query}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("failed");

      return res.json();
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
  const handleRemoveMembers = async () => {
    setLoading(true);
    if (!selected.length) return;

    if (!window.confirm("Remove selected members?")) return;

    try {
      await Promise.all(
        selected.map((id) =>
          fetch(
            `${server}/api/messages/${conversationId}/remove-member/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ),
      );

      setSelected([]);
      setRemoveMode(false);
      setCount((c) => c - selected.length);
      queryClient.invalidateQueries(["group-members", conversationId]);
      onUpdated();
    } catch (e) {
      console.error(e);
      alert("Failed to remove members");
    } finally {
      setLoading(false);
    }
  };
  const handleLeaveGroup = async () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this group?",
    );

    if (!confirmLeave) return;

    try {
      const res = await fetch(
        `${server}/api/messages/${conversationId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      // refresh conversations
      onUpdated();

      // close modal
      close();
      setActive(null);
    } catch (err) {
      console.error(err);
      alert("Failed to leave group");
    }
  };
  const handleSearch = async (q) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    // return cached results
    if (searchCache.current[q]) {
      setSearchResults(searchCache.current[q]);
      return;
    }

    setSearchLoading(true);

    try {
      const users = await searchUsers(server, token, q);

      // save in cache
      searchCache.current[q] = users;

      setSearchResults(users);
    } finally {
      setSearchLoading(false);
    }
  };
  const handleAddMembers = async () => {
    if (!addSelected.length) return;

    setLoading(true);

    try {
      await fetch(`${server}/api/messages/${conversationId}/add-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          members: addSelected.map((u) => u.id),
        }),
      });

      setCount((c) => c + addSelected.length);

      setAddSelected([]);
      setAddMode(false);

      queryClient.setQueryData(
        ["group-members", conversationId, query, page],
        (old) => {
          if (!old) return old;

          const newMembers = addSelected.map((u) => ({
            ...u,
            role: "member",
            profile: u.avatar_url,
          }));

          return {
            ...old,
            members: [...newMembers, ...old.members],
          };
        },
      );
      onUpdated();

      close(); // close modal after success
    } catch (err) {
      console.error(err);
      alert("Failed to add members");
    } finally {
      setLoading(false);
    }
  };
  const existingMemberIds = data?.members?.map((m) => m.id) || [];
  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <div className="flex-r jspacebtw">
            <h3>{title}</h3>
            <FiX style={{ cursor: "pointer" }} onClick={close} />
          </div>

          <div
            style={{ fontSize: "13px", color: "#777", marginBottom: "10px" }}
          >
            {count} members
          </div>
          <div style={{ marginBottom: "10px" }}>
            {!removeMode && !addMode && (
              <div className="flex-r jspacebtw center-c">
                <button
                  className="form-button"
                  onClick={() => setRemoveMode(true)}
                >
                  Remove Members
                </button>

                <button
                  className="form-button"
                  onClick={() => setAddMode(true)}
                >
                  Add Members
                </button>

                <div>
                  <button
                    className="form-button flex-r center-r center-c"
                    style={{ color: "white", background: "red" }}
                    onClick={handleLeaveGroup}
                  >
                    {/* leave icon */}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "white" }}
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {removeMode && (
              <div className="flex-r center-c gap10">
                <button
                  className="form-button danger"
                  onClick={handleRemoveMembers}
                >
                  {loading ? <BeatLoader size={6} /> : "Remove them"}
                </button>

                <FiX
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setRemoveMode(false);
                    setSelected([]);
                  }}
                />
              </div>
            )}

            {addMode && (
              <div className="flex-r center-c gap10">
                <button className="form-button" onClick={handleAddMembers}>
                  {loading ? <BeatLoader size={6} /> : "Add them"}
                </button>

                <FiX
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setAddMode(false);
                    setSelected([]);
                  }}
                />
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder={addMode ? "Search users to add" : "Search members"}
            className="search-input"
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              setPage(1);

              if (addMode) {
                handleSearch(q);
              }
            }}
          />
          {!addMode && (
            <div
              id="members-scroll"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <InfiniteScroll
                dataLength={data?.members?.length || 0}
                next={() => setPage((p) => p + 1)}
                hasMore={true}
                loader={<BeatLoader size={6} />}
                scrollableTarget="members-scroll"
              >
                {isLoading && <div>Loading...</div>}

                {data?.members?.map((m) => {
                  const checked = selected.includes(m.id);

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {removeMode && m.role !== "admin" && (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              setSelected(selected.filter((id) => id !== m.id));
                            } else {
                              setSelected([...selected, m.id]);
                            }
                          }}
                        />
                      )}

                      {m.profile ? (
                        <img
                          src={m.profile}
                          style={{ width: 35, height: 35, borderRadius: "50%" }}
                          alt=""
                        />
                      ) : (
                        <div
                          className="avatar-fallback"
                          style={{ width: "35px", height: "35px" }}
                        >
                          {`${m.first_name?.[0] || ""}${m.last_name?.[0] || ""}`}
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        {m.first_name} {m.last_name}
                      </div>

                      {m.role === "admin" && (
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          admin
                        </span>
                      )}
                    </div>
                  );
                })}
              </InfiniteScroll>
            </div>
          )}
          {addSelected.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                margin: "10px 0",
                flexWrap: "wrap",
              }}
            >
              {addSelected.map((u) => (
                <div key={u.id} style={{ position: "relative" }}>
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url || "/avatar.jpg"}
                      style={{
                        width: 35,
                        height: 35,
                        borderRadius: "50%",
                      }}
                      alt=""
                    />
                  ) : (
                    <div
                      className="avatar-fallback"
                      style={{ width: "35px", height: "35px" }}
                    >
                      {`${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`}
                    </div>
                  )}

                  <FiX
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      background: "#fff",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setAddSelected(addSelected.filter((x) => x.id !== u.id))
                    }
                  />
                </div>
              ))}
            </div>
          )}
          {addMode && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {searchLoading && <div>Searching...</div>}

                {searchResults
                  .filter((u) => !existingMemberIds.includes(u.id))
                  .map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (addSelected.find((x) => x.id === u.id)) {
                          setAddSelected(
                            addSelected.filter((x) => x.id !== u.id),
                          );
                        } else {
                          setAddSelected([...addSelected, u]);
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          margin: "10px 0",
                          flexWrap: "wrap",
                        }}
                      >
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url || "/avatar.jpg"}
                            style={{
                              width: 35,
                              height: 35,
                              borderRadius: "50%",
                            }}
                            alt=""
                          />
                        ) : (
                          <div
                            className="avatar-fallback"
                            style={{ width: "35px", height: "35px" }}
                          >
                            {`${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`}
                          </div>
                        )}
                        {u.first_name} {u.last_name}
                        <br />
                        {u.university}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
