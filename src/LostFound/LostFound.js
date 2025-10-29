import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./LostFound.css";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { BeatLoader, ClipLoader } from "react-spinners";

const PAGE_SIZE = 10; // match backend or pass &limit
const TABS = ["lost", "found", "my"];

export default function LostFound() {
  // below other useState(...)
  const [isSubmitting, setIsSubmitting] = useState(false); // create/edit modal
  const [deletingId, setDeletingId] = useState(null); // which item is deleting (id or null)

  const [activeTab, setActiveTab] = useState("lost");
  const [viewItems, setViewItems] = useState([]);
  const [uiLoading, setUiLoading] = useState(false);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editId, setEditId] = useState(null);

  // form
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemType, setItemType] = useState("lost");

  // read-more
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 🔧 kebab menu state + refs map (fix)
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRefs = useRef(new Map()); // id -> HTMLElement

  // per-tab cache
  const cacheRef = useRef(
    TABS.reduce((acc, t) => {
      acc[t] = {
        items: [],
        page: 1,
        hasMore: true,
        initialized: false,
        inFlight: false,
      };
      return acc;
    }, {})
  );

  const listRef = useRef(null);
  const observer = useRef(null);

  const getAuth = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const appendUnique = (oldItems, newItems) => {
    const seen = new Set(oldItems.map((i) => i.id));
    return [...oldItems, ...(newItems?.filter((i) => !seen.has(i.id)) || [])];
  };

  const fmt = (ts) =>
    ts
      ? new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : "—";

  const fetchNextPage = useCallback(
    async (tab) => {
      const bucket = cacheRef.current[tab];
      if (!bucket.hasMore || bucket.inFlight) return;

      bucket.inFlight = true;
      if (tab === activeTab) setUiLoading(true);

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_SERVER}/api/lostfound?filter=${tab}&page=${bucket.page}&limit=${PAGE_SIZE}`,
          getAuth()
        );
        const fetched = Array.isArray(res?.data?.items) ? res.data.items : [];

        bucket.items = appendUnique(bucket.items, fetched);
        bucket.page += 1;
        bucket.hasMore = fetched.length > 0; // robust
        bucket.initialized = true;

        if (tab === activeTab) setViewItems([...bucket.items]);
      } catch (e) {
        console.error("fetchNextPage failed:", e);
      } finally {
        bucket.inFlight = false;
        if (tab === activeTab) setUiLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    const b = cacheRef.current[activeTab];
    setViewItems([...b.items]);
    if (!b.initialized) fetchNextPage(activeTab);
  }, [activeTab, fetchNextPage]);

  // 🔧 outside click that respects per-item refs
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!menuOpenId) return;
      const node = menuRefs.current.get(menuOpenId);
      if (!node) {
        setMenuOpenId(null);
        return;
      }
      if (!node.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [menuOpenId]);

  // infinite scroll
  const lastItemRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const b = cacheRef.current[activeTab];
            if (b.hasMore && !b.inFlight) fetchNextPage(activeTab);
          }
        },
        { root: listRef.current || null, rootMargin: "400px", threshold: 0 }
      );

      if (node) observer.current.observe(node);
    },
    [activeTab, fetchNextPage]
  );

  // cache helpers
  const replaceItemInAllCaches = (updated) => {
    ["lost", "found", "my"].forEach((t) => {
      const b = cacheRef.current[t];
      const idx = b.items.findIndex((x) => x.id === updated.id);
      if (idx !== -1) {
        const copy = [...b.items];
        copy[(idx = idx)] = { ...copy[idx], ...updated };
        b.items = copy;
        if (t === activeTab) setViewItems(copy);
      }
    });
  };

  const removeItemFromAllCaches = (id) => {
    ["lost", "found", "my"].forEach((t) => {
      const b = cacheRef.current[t];
      const filtered = b.items.filter((x) => x.id !== id);
      if (filtered.length !== b.items.length) {
        b.items = filtered;
        if (t === activeTab) setViewItems(filtered);
      }
    });
  };

  // modal open helpers
  const openCreate = () => {
    setModalMode("create");
    setEditId(null);
    setItemName("");
    setItemDescription("");
    setItemLocation("");
    setItemType("lost");
    setShowModal(true);
  };

  const openEdit = (it) => {
    setModalMode("edit");
    setEditId(it.id);
    setItemName(it.item_name || "");
    setItemDescription(it.item_description || "");
    setItemLocation(it.item_location || "");
    setItemType(it.status || "lost");
    setShowModal(true);
  };

  const handleDelete = async (it) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      setDeletingId(it.id);
      await axios.delete(
        `${process.env.REACT_APP_SERVER}/api/lostfound/${it.id}`,
        getAuth()
      );
      removeItemFromAllCaches(it.id);
    } catch (e) {
      console.error("delete failed:", e);
      alert("Failed to delete item.");
    } finally {
      setMenuOpenId(null);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      item_name: itemName.trim(),
      item_description: itemDescription.trim(),
      item_location: itemLocation.trim(),
      status: itemType,
    };
    if (!body.item_name || !body.item_description || !body.item_location)
      return;

    try {
      setUiLoading(true);
      setIsSubmitting(true);

      if (modalMode === "create") {
        const res = await axios.post(
          `${process.env.REACT_APP_SERVER}/api/lostfound`,
          body,
          getAuth()
        );
        const newItem = res?.data?.item;

        ["my", itemType].forEach((t) => {
          const b = cacheRef.current[t];
          if (newItem && !b.items.find((i) => i.id === newItem.id)) {
            b.items = [newItem, ...b.items];
          }
          b.initialized = true;
          if (t === activeTab) setViewItems([...b.items]);
        });
      } else {
        const res = await axios.put(
          `${process.env.REACT_APP_SERVER}/api/lostfound/${editId}`,
          body,
          getAuth()
        );
        const updated = res?.data?.item;
        if (updated) replaceItemInAllCaches(updated);
      }

      setShowModal(false);
      setMenuOpenId(null);
      setModalMode("create");
      setEditId(null);
      setItemName("");
      setItemDescription("");
      setItemLocation("");
      setItemType("lost");
    } catch (e) {
      console.error("submit failed:", e);
      alert("Failed to save item.");
    } finally {
      setUiLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="homecontainer-3">
      <div className="homecontainer-3-1">
        <h3>Lost and Found</h3>
        <br />
        <div className="tabs-container">
          {TABS.map((t) => (
            <button
              key={t}
              className={`switch-btn ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "my" ? "My Posts" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <button className="post-btn" onClick={openCreate}>
            Report
          </button>
        </div>

        <div className="items-list" ref={listRef}>
          {viewItems.length === 0 && !uiLoading && (
            <div className="no-items">No items listed</div>
          )}

          {viewItems.map((item, idx) => {
            const isLast = idx === viewItems.length - 1;
            const isOpen = expanded.has(item.id);
            const showReadMore = (item.item_description || "").length > 160;

            const CardContent = () => (
              <>
                {/* Top line: reporter + kebab */}
                <div className="meta-line">
                  <div className={`status-pill status-${item.status}`}>
                    {item.status}
                  </div>
                  <span className="meta-value">
                    {item.resolved_at && <FaCheckCircle />}
                  </span>
                </div>
                <div className="reporter-line">
                  {item.reporter_profile_url ? (
                    <img
                      className="reporter-avatar"
                      src={item.reporter_profile_url}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/avatar.jpg";
                      }}
                    />
                  ) : (
                    <img className="reporter-avatar" src="/avatar.jpg" alt="" />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="reporter-name">
                      {item.reporter_name || "—"}
                    </div>
                    <div className="reporter-name">{item.reporter_course}</div>
                  </div>

                  {/* Kebab menu for "my" tab */}
                  {activeTab === "my" && (
                    <div
                      className="kebab-wrap"
                      ref={(el) => {
                        if (el) menuRefs.current.set(item.id, el);
                        else menuRefs.current.delete(item.id);
                      }}
                      style={{ position: "relative" }}
                    >
                      <button
                        type="button"
                        className="kebab-btn"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId((s) =>
                            s === item.id ? null : item.id
                          );
                        }}
                        disabled={deletingId === item.id}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 6,
                          cursor:
                            deletingId === item.id ? "not-allowed" : "pointer",
                          borderRadius: 8,
                        }}
                        title="More options"
                      >
                        <BsThreeDotsVertical size={18} />
                      </button>

                      {menuOpenId === item.id && (
                        <div
                          className="kebab-menu"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                            minWidth: 160,
                            zIndex: 30, // ensure above card
                            overflow: "hidden",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="kebab-item"
                            onClick={() => openEdit(item)}
                            style={menuItemStyle}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="kebab-item"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            style={{
                              ...menuItemStyle,
                              color: "#b91c1c",
                              opacity: deletingId === item.id ? 0.6 : 1,
                              cursor:
                                deletingId === item.id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {deletingId === item.id ? (
                              <span
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "center",
                                }}
                              >
                                Deleting
                                <ClipLoader color="#db1212" size={13} />
                              </span>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Title */}
                <p className="item-title">{item.item_name}</p>
                {/* Description */}
                <div className={`item-desc ${isOpen ? "open" : ""}`}>
                  {item.item_description}
                </div>
                {showReadMore && (
                  <button
                    type="button"
                    className="readmore-link"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isOpen ? "Read less" : "Read more"}
                  </button>
                )}
                {/* Status + resolved */}
                <div className="report-contianer">
                  <span className="meta-label">{fmt(item.reported_at)}</span>
                </div>
              </>
            );

            return isLast ? (
              <div className="item-card" key={item.id} ref={lastItemRef}>
                <CardContent />
              </div>
            ) : (
              <div className="item-card" key={item.id}>
                <CardContent />
              </div>
            );
          })}

          {uiLoading && <div className="loading">Loading...</div>}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-lf" onClick={(e) => e.stopPropagation()}>
              <h3>
                {modalMode === "create" ? "Post Lost/Found Item" : "Edit Item"}
              </h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Item Name
                  <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Location
                  <input
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Type
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </label>
                <div className="modal-buttons">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={isSubmitting ? "btn-loading" : ""}
                    aria-live="polite"
                  >
                    {isSubmitting
                      ? modalMode === "create" && (
                          <BeatLoader color="#ffffff" size={10} />
                        )
                      : modalMode === "create"
                      ? "Submit"
                      : "Save"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.92rem",
};
