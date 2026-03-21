import { useState } from "react";
import { FiX } from "react-icons/fi";
import api from "../utils/api";
import { BeatLoader } from "react-spinners";
import { searchUsers } from "../utils/searchUsers";
export default function CreateGroupModal({ close, onCreated }) {
  const server = process.env.REACT_APP_SERVER;
  const token = localStorage.getItem("token");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // SEARCH USERS
  const searchPeople = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const users = await searchUsers(server, token, q);

      setResults(users);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ADD USER
  const addUser = (user) => {
    if (selected.find((u) => u.id === user.id)) return;
    setSelected([...selected, user]);
  };

  // REMOVE USER
  const removeUser = (id) => {
    setSelected(selected.filter((u) => u.id !== id));
  };

  // CREATE GROUP
  const createGroup = async () => {
    if (!title.trim()) {
      alert("Enter group name");
      return;
    }

    if (selected.length < 1) {
      alert("Select at least one member");
      return;
    }

    try {
      setCreating(true);

      await api.post(
        `${server}/api/messages/group`,
        {
          title,
          members: selected.map((u) => u.id),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (onCreated) onCreated();
      close();
    } catch (err) {
      console.error("Create group failed", err);
      alert("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Create Group</h3>
          <FiX style={{ cursor: "pointer" }} onClick={close} />
        </div>

        {/* GROUP NAME */}
        <input
          type="text"
          placeholder="Group name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="search-input"
          style={{ marginBottom: "10px" }}
        />

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search students or professors"
          className="search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchPeople(e.target.value);
          }}
        />

        {/* SELECTED USERS */}
        {selected.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "10px 0",
              flexWrap: "wrap",
            }}
          >
            {selected.map((u) => (
              <div key={u.id} style={{ position: "relative" }}>
                <img
                  src={u.avatar_url || "/avatar.jpg"}
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                  }}
                  alt=""
                />

                <FiX
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    background: "#fff",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                  onClick={() => removeUser(u.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* SEARCH RESULTS */}
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          {loading && (
            <div style={{ textAlign: "center", margin: "10px" }}>
              <BeatLoader size={8} />
            </div>
          )}

          {results.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px",
                cursor: "pointer",
              }}
              onClick={() => addUser(u)}
            >
              {u.avatar_url ? (
                <img
                  src={u.avatar_url}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                  }}
                  alt=""
                />
              ) : (
                <div className="avatar-fallback">
                  {`${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`}
                </div>
              )}

              <div>
                {u.first_name} {u.last_name}
              </div>
            </div>
          ))}
        </div>

        {/* CREATE BUTTON */}
        <button
          className="form-button"
          style={{ marginTop: "15px" }}
          onClick={createGroup}
          disabled={creating}
        >
          {creating ? <BeatLoader size={6} /> : "Create Group"}
        </button>
      </div>
    </div>
  );
}
