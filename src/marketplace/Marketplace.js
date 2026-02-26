


import  { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Cropper from "react-easy-crop";
import "./Marketplace.css";
import TimeAgo from "../utils/TimeAgo";
import MessageModal from "../messgaes/MessageModal";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
const API_BASE = process.env.REACT_APP_SERVER || "http://localhost:5000";
const MAX_IMAGES = 6;
const fetchListingDetails = async (listingId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/marketplace/${listingId}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load listing");

  return data;
};
export default function Marketplace() {
  const navigate = useNavigate();

  const [view, setView] = useState("feed"); // "feed" | "mine"
  const [editingItem, setEditingItem] = useState(null); // listing object or null


  const [selected, setSelected] = useState(null);

  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  // POST MODAL (create/edit)
  const [openPost, setOpenPost] = useState(false);

  // MESSAGE MODAL
  const [selectedPeer, setSelectedPeer] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = storedUser?.id || null;

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---- API: feed
  const fetchFeed = async ({ limit = 12, cursor, id }) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    if (id) params.set("id", id);

    const res = await fetch(`${API_BASE}/api/marketplace?${params.toString()}`, {
      method: "GET",
      headers: { ...getAuthHeader() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.msg || "Failed to load marketplace");
    return data;
  };

  // ---- API: search
  const fetchSearch = async ({ q, limit = 12, cursor, id }) => {
    const params = new URLSearchParams();
    params.set("q", q);
    params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    if (id) params.set("id", id);

    const res = await fetch(`${API_BASE}/api/marketplace/search?${params.toString()}`, {
      method: "GET",
      headers: { ...getAuthHeader() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.msg || "Search failed");
    return data;
  };

  // ---- API: mine
  const fetchMine = async ({ limit = 12, cursor, id }) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    if (id) params.set("id", id);

    const res = await fetch(`${API_BASE}/api/marketplace/mine/list?${params.toString()}`, {
      method: "GET",
      headers: { ...getAuthHeader() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || data?.msg || "Failed to load my items");
    return data;
  };



  const queryClient = useQueryClient();

const {
  data,
  fetchNextPage,
  hasNextPage,
  isLoading,
  isError,
  error,
} = useInfiniteQuery({
  queryKey: ["marketplace", view, debounced],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }) => {
    const limit = 12;

    const isMine = view === "mine";
    const isSearching = !!debounced && !isMine;

    const params = {
      limit,
      cursor: pageParam?.cursor,
      id: pageParam?.id,
    };

    if (isMine) return fetchMine(params);
    if (isSearching) return fetchSearch({ ...params, q: debounced });
    return fetchFeed(params);
  },
  getNextPageParam: (lastPage) => {
    if (!lastPage?.nextCursor) return undefined;
    return lastPage.nextCursor;
  },
   keepPreviousData: true,
});
const items = data?.pages.flatMap((page) => page.items) || [];

  // ---- debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);



  // ---------- LOAD MORE (INFINITE) ----------

  // ---------- OPEN DETAILS MODAL ----------
const openItem = (item) => {
  setSelected(item); // open immediately
};

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    const res = await fetch(`${API_BASE}/api/marketplace/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeader() },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.message || "Delete failed");
      return;
    }

 queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    if (selected?.id === id) setSelected(null);
  };

  // ---------- OPEN MESSAGE ----------
  const openMessageSeller = (seller) => {
    if (!seller?.id) return;
    if (loggedInUserId && String(loggedInUserId) === String(seller.id)) return;
    setSelectedPeer(seller);
  };

  return (
    <>
    
        <div className="market-wrap">
          <div className="market-header">
            <h2 className="market-title">Marketplace</h2>
          </div>

          <div className="market-actions">
            <div className="market-search">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items by title..."
                disabled={view === "mine"}
              />
            </div>

            <div className="market-actions-tab">
               <div
                className={`market-btn ${view === "feed" ? "market-button" : "market-btn-secondary"}`}><svg
 onClick={() => setView("feed")}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M3 9l1-5h16l1 5" />
  <path d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
  <path d="M9 22V12h6v10" />
</svg></div>
               <div className={`market-btn ${view === "mine" ? "market-btn-primary" : "market-btn-secondary"}`}>
                 <svg
onClick={() => setView("mine")}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>
               </div>
              
              
              
        

             
             
            </div>

            <div
              className="market-btn market-btn-primary"
              onClick={() => {
                setEditingItem(null);
                setOpenPost(true);
              }}
            >
            <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <line x1="12" y1="5" x2="12" y2="19" />
  <line x1="5" y1="12" x2="19" y2="12" />
</svg>
            </div>

          </div>

          {isError ? <div className="market-err">{error.message}</div> : null}

          {isLoading ? (
            <div style={{ padding: 12 }}>Loading items...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 12, color: "#666" }}>
              {view === "mine"
                ? "You haven't posted any items yet."
                : debounced
                ? "No results found."
                : "No items yet. Be the first to post."}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={items.length}
  next={fetchNextPage}
  hasMore={!!hasNextPage}
  // loader={<div style={{ padding: 12 }}>Loading more...</div>}
              endMessage={
                <div style={{ padding: 12, color: "#666", textAlign: "center" }}>
                  You reached the end.
                </div>
              }
            >
              <div className="market-grid">
                {items.map((it) => (
                  <div
  key={it.id}
  className="market-card"
  onClick={() => openItem(it)}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ["listing", it.id],
      queryFn: () => fetchListingDetails(it.id),
    });
  }}
>
                    <div className="market-thumb-wrap">
                      {it.thumbnail ? (
                        <img className="market-thumb" src={it.thumbnail} alt={it.title} />
                      ) : (
                        <div className="market-noimg">No Image</div>
                      )}
                    </div>

                    <div className="market-card-body">
                      <div className="market-card-title">{it.title}</div>

                      <div className="market-meta">
                        <span>{it.location}</span>
                        <span>•</span>
                        <span>{it.price ? `${getCurrencySymbol(it.currency)} ${Number(it.price).toFixed(0)}` : "Free"}</span>
                      </div>

                      <div className="market-seller">
                        {it.first_name} {it.last_name}
                      </div>

                      {view === "mine" ? (
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            className="market-btn market-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(it);
                              setOpenPost(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="market-btn market-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(it.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          )}

          {/* Listing modal */}
          {selected ? (
            <ListingModal
              item={selected}
              onClose={() => setSelected(null)}
              loggedInUserId={loggedInUserId}
              onNavigateProfile={(id) => navigate(`/profile/${id}`)}
              onMessageSeller={openMessageSeller}
              onEditMine={(listing) => {
                setEditingItem(listing);
                setOpenPost(true);
              }}
              onDeleteMine={(id) => handleDelete(id)}
            />
          ) : null}

          {/* Create/Edit modal */}
          {openPost ? (
            <PostItemModal
              mode={editingItem ? "edit" : "create"}
              initialData={editingItem}
              onClose={() => {
                setOpenPost(false);
                setEditingItem(null);
              }}
              onCreated={(newListing) => {
                queryClient.invalidateQueries(["marketplace"]);
                setOpenPost(false);
                setEditingItem(null);
              }}
          onUpdated={() => {
  queryClient.invalidateQueries(["marketplace"]);
  setOpenPost(false);
  setEditingItem(null);
}}
              getAuthHeader={getAuthHeader}
            />
          ) : null}

          {/* Message modal */}
          {selectedPeer ? (
            <MessageModal
              isOpen={!!selectedPeer}
              onClose={() => setSelectedPeer(null)}
              peer={selectedPeer}
            />
          ) : null}
        </div>
   
    </>
  );
}

function getCurrencySymbol(currencyCode) {
  return (0).toLocaleString(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/\d/g, "").trim();
}

/* ---------- Listing modal ---------- */
function ListingModal({
  item,
  onClose,
  loggedInUserId,
  onNavigateProfile,
  onMessageSeller,
  onEditMine,
  onDeleteMine,
}) {
  const { data, isLoading, isError, error } = useQuery({
  queryKey: ["listing", item.id],
  queryFn: () => fetchListingDetails(item.id),
   keepPreviousData: true,
  staleTime: 1000 * 60 * 10, // cache for 10 minutes
});
 const listing = data?.listing || item;
const images = data?.images || [];
const seller = data?.seller || item.seller;
  const fallbackImages = item.thumbnail ? [{ presignedUrl: item.thumbnail }] : [];
  const imgList = images.length ? images : fallbackImages;

  const [active, setActive] = useState(0);
  const activeUrl = imgList[active]?.presignedUrl || imgList[0]?.presignedUrl;

  const canPrev = active > 0;
  const canNext = active < imgList.length - 1;

  const prev = () => canPrev && setActive((p) => p - 1);
  const next = () => canNext && setActive((p) => p + 1);

  const isMine =
    seller?.id && loggedInUserId
      ? String(seller.id) === String(loggedInUserId)
      : false;


  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, imgList.length]);

  return (
    <div className="m-backdrop" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-top">
          <div className="feed-container-1">

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {seller?.profile ? (
              <img src={seller.profile} className="avatar-img" alt="profile" />
            ) : (
              <div className="avatar-fallback">
                {`${seller?.first_name?.[0] || ""}${seller?.last_name?.[0] || ""}`.toUpperCase()}
              </div>
            )}

            <div>
              <div
                className={`username ${!isMine ? "clickable" : ""}`}
                onClick={!isMine ? () => onNavigateProfile(item.seller.id) : undefined}
              >
                {`${seller?.first_name || ""} ${seller?.last_name || ""}`.trim() || "Unknown User"}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {seller?.university || ""}
              </div>
            </div>
          </div>
          </div>

          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div className="m-content">
          <div>
            <div className="m-image-box m-carousel">
              {activeUrl ? (
                <img className="m-main-img" src={activeUrl} alt={listing.title} />
              ) : (
                <div className="market-noimg">No image</div>
              )}

              {imgList.length > 1 ? (
                <>
                  <button className={`m-nav m-nav-left ${!canPrev ? "m-nav-disabled" : ""}`} onClick={prev} disabled={!canPrev}>‹</button>
                  <button className={`m-nav m-nav-right ${!canNext ? "m-nav-disabled" : ""}`} onClick={next} disabled={!canNext}>›</button>

                  <div className="m-dots">
                    {imgList.map((_, idx) => (
                      <button
                        key={idx}
                        className={`m-dot ${idx === active ? "m-dot-active" : ""}`}
                        onClick={() => setActive(idx)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {imgList.length > 1 ? (
              <div className="m-thumbs">
                {imgList.map((im, idx) => (
                  <img
                    key={idx}
                    className="m-thumb"
                    src={im.presignedUrl}
                    alt={`thumb-${idx}`}
                    style={{ outline: idx === active ? "2px solid #111" : "none" }}
                    onClick={() => setActive(idx)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="m-right">
            <div className="m-h-title">{listing.title}</div>

            <div className="m-price">
              {listing.price ? `${getCurrencySymbol(listing.currency)} ${Number(listing.price).toFixed(0)}` : "Free"}
            </div>

            <div className="m-time">
              <TimeAgo timestamp={listing.created_at} /> in <span>{listing.location || "-"}</span>
            </div>

            {!isMine ? (
              <button className="market-btn market-btn-primary" style={{ width: "fit-content" }} onClick={() => onMessageSeller(item.seller)}>
                Message seller
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="market-btn market-btn-secondary" onClick={() => onEditMine(listing)}>
                  Edit
                </button>
                <button className="market-btn market-btn-secondary" onClick={() => onDeleteMine(listing.id)}>
                  Delete
                </button>
              </div>
            )}

            <div className="m-row">Details</div>
            <div className="m-row"><span className="m-label">Category:</span><span>{listing.category || "-"}</span></div>
            <div className="m-row"><span className="m-label">Condition:</span><span>{listing.condition || "-"}</span></div>

            <div>
              <div className="m-label">Description</div>
              <div className="m-desc">{listing.description || "-"}</div>
            </div>

            {listing._loadingDetails ? <div style={{ color: "#666" }}>Loading full details...</div> : null}
            {listing._err ? <div style={{ color: "#a11" }}>{listing._err}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Post item modal (create + edit) ---------- */
function PostItemModal({ mode, initialData, onClose, onCreated, onUpdated, getAuthHeader }) {
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [condition, setCondition] = useState("good");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("university");

  const [images, setImages] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState("");

  // prefill for edit
  useEffect(() => {
    if (mode !== "edit" || !initialData) return;
    setTitle(initialData.title || "");
    setDescription(initialData.description || "");
    setPrice(initialData.price ?? "");
    setCurrency(initialData.currency || "INR");
    setCondition(initialData.condition || "good");
    setCategory(initialData.category || "");
    setLocation(initialData.location || "");
    setVisibility(initialData.visibility || "university");

    // edit mode: keep images empty (we are not editing images in PUT)
    setImages([]);
  }, [mode, initialData]);

  // cleanup URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        if (img.editedPreviewUrl) URL.revokeObjectURL(img.editedPreviewUrl);
      });
    };
  }, [images]);

  const onPickImages = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const mapped = picked.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      editedFile: null,
      editedPreviewUrl: null,
    }));

    const total = [...images, ...mapped];

    if (total.length > MAX_IMAGES) {
      mapped.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      setFormErr(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    setFormErr("");
    setImages(total);
    e.target.value = "";
  };

  const submit = async () => {
    setFormErr("");

    if (!title.trim() || !description.trim() || !location.trim()) {
      setFormErr("Title, description, and location are required.");
      return;
    }

    try {
      setSubmitting(true);

      // EDIT mode (fields only)
      if (mode === "edit" && initialData?.id) {
        const res = await fetch(`${API_BASE}/api/marketplace/${initialData.id}`, {
          method: "PUT",
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            price,
            currency,
            condition,
            category,
            location,
            visibility,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Update failed");
        onUpdated?.(data.listing);
        return;
      }

      // CREATE mode (needs images)
      if (images.length < 1) {
        setFormErr("Please select at least 1 image.");
        return;
      }

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("location", location.trim());
      fd.append("visibility", visibility);

      if (category) fd.append("category", category);
      if (condition) fd.append("condition", condition);
      if (currency) fd.append("currency", currency);
      if (price !== "") fd.append("price", price);

      for (const img of images) {
        const fileToUpload = img.editedFile
          ? img.editedFile
          : await compressWithoutCrop(img.file, { maxSize: 1600, quality: 0.85 });

        fd.append("images", fileToUpload);
      }

      const res = await fetch(`${API_BASE}/api/marketplace`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.msg || "Failed to post item");

      const createdListing = {
        ...data.listing,
        thumbnail: data.images?.[0]?.presignedUrl || null,
        first_name: "You",
        last_name: "",
      };

      onCreated?.(createdListing);
    } catch (e) {
      setFormErr(e.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="m-backdrop" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-top">
          <div className="m-title">{mode === "edit" ? "Edit Item" : "Post Item"}</div>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div className="p-form">
          {formErr ? <div className="p-error">{formErr}</div> : null}

          {mode === "create" ? (
            <div className="p-images">
              <div className="p-field">
                <label>Select Images (min 1, max {MAX_IMAGES})</label>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  multiple
                  onChange={onPickImages}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="market-btn market-btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: "fit-content" }}
                >
                  Upload
                </button>
              </div>

              {images.length ? (
                <div className="p-preview-row">
                  {images.map((img, idx) => {
                    const showSrc = img.editedPreviewUrl || img.previewUrl;
                    return (
                      <div key={idx} style={{ display: "grid", gap: 6 }}>
                        <img className="p-preview" src={showSrc} alt={`preview-${idx}`} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className="market-btn market-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => setEditIndex(idx)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="market-btn market-btn-secondary"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => {
                              if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                              if (img.editedPreviewUrl) URL.revokeObjectURL(img.editedPreviewUrl);
                              setImages((prev) => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ color: "#666", fontSize: 13 }}>
              Images are not editable in Edit mode (only fields).  
              If you want image editing on edit, tell me — we’ll add it.
            </div>
          )}

          <div className="p-grid">
            <div className="p-field">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="p-field">
              <label>Price</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" />
            </div>

            <div className="p-field">
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="p-field">
              <label>Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="new">New</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div className="p-field">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="housing">Housing</option>
                <option value="books_notes">Books & Notes</option>
                <option value="furniture">Furniture</option>
                <option value="fashion">Clothing & Accessories</option>
                <option value="hostel_items">Hostel / Room Essentials</option>
                <option value="vehicles">Bicycles & Vehicles</option>
                <option value="gadgets">Gadgets & Accessories</option>
                <option value="services">Services</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="p-field">
              <label>Location *</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="p-field">
              <label>Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="university">University</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="p-field">
            <label>Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="p-actions">
            <button className="market-btn market-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button className="market-btn market-btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>

          {editIndex !== null ? (
            <EditImageModal
              src={images[editIndex]?.editedPreviewUrl || images[editIndex]?.previewUrl}
              onClose={() => setEditIndex(null)}
              onSave={(editedFile) => {
                const editedUrl = URL.createObjectURL(editedFile);
                setImages((prev) =>
                  prev.map((img, i) => {
                    if (i !== editIndex) return img;
                    if (img.editedPreviewUrl) URL.revokeObjectURL(img.editedPreviewUrl);
                    return { ...img, editedFile, editedPreviewUrl: editedUrl };
                  })
                );
                setEditIndex(null);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- Image helpers ---------- */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

async function compressWithoutCrop(file, { maxSize = 1600, quality = 0.85, mimeType = "image/jpeg" } = {}) {
  const url = URL.createObjectURL(file);
  try {
    const img = await createImage(url);

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const outW = Math.round(img.width * scale);
    const outH = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, outW, outH);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
    return new File([blob], `market-${Date.now()}.jpg`, { type: mimeType });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function cropResizeCompress(imageSrc, cropPixels, opts) {
  const {
    outWidth = 1080,
    outHeight = 1080,
    quality = 0.82,
    mimeType = "image/jpeg",
    rotation = 0,
  } = opts || {};

  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");

  ctx.save();
  ctx.translate(outWidth / 2, outHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-outWidth / 2, -outHeight / 2);

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outWidth,
    outHeight
  );

  ctx.restore();

  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), mimeType, quality)
  );

  return blob;
}

/* ---------- Edit image modal ---------- */
function EditImageModal({ src, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedPixels, setCroppedPixels] = useState(null);

  const onCropComplete = (_, pixels) => setCroppedPixels(pixels);

  const save = async () => {
    if (!croppedPixels) return;

    const blob = await cropResizeCompress(src, croppedPixels, {
      outWidth: 1080,
      outHeight: 1080,
      quality: 0.82,
      mimeType: "image/jpeg",
      rotation,
    });

    const edited = new File([blob], `market-${Date.now()}.jpg`, { type: "image/jpeg" });
    onSave(edited);
  };

  return (
    <div className="m-backdrop m-backdrop-top" onClick={onClose}>
      <div className="m-modal m-modal-top" onClick={(e) => e.stopPropagation()}>
        <div className="m-top">
          <div className="m-title">Edit image</div>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          <div className="edit-crop-area">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1 / 1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="edit-controls" style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <div className="m-label">Zoom</div>
              <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <div className="m-label">Rotate</div>
              <input type="range" min="-180" max="180" step="1" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div className="p-actions">
              <button className="market-btn market-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="market-btn market-btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
