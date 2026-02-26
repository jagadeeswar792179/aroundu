import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import "./custom-select.css";

export default function CustomSelect({
  options = [],
  value = null,
  onChange = () => {},
  placeholder = "Select...",
  disabled = false,
  direction = "down",
  name,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const searchRef = useRef(null);

  /* ------------------ FILTER + RANK ------------------ */

  const normalize = (str) => str.toLowerCase().trim();

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  const exact = [];
  const startsWith = [];
  const wordStarts = [];
  const contains = [];

  for (const opt of options) {
    const label = opt.label.toLowerCase();

    if (label === q) {
      exact.push(opt);
    } 
    else if (label.startsWith(q)) {
      startsWith.push(opt);
    } 
    else if (label.split(" ").some(word => word.startsWith(q))) {
      wordStarts.push(opt);
    } 
    else if (label.includes(q)) {
      contains.push(opt);
    }
  }

  return [...exact, ...startsWith, ...wordStarts, ...contains];
}, [options, query]);



  /* ------------------ OPEN / CLOSE ------------------ */

  const openMenu = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery(""); // reset search
  }, []);

  const handleControlClick = () => {
    open ? closeMenu() : openMenu();
  };

  /* ------------------ SELECT ------------------ */

  const handleSelect = (opt) => {
    onChange(opt);
    closeMenu();
    buttonRef.current?.focus();
  };

  /* ------------------ CLICK OUTSIDE ------------------ */

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    if (open) document.addEventListener("mousedown", handleOutside);

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, closeMenu]);

  /* ------------------ AUTO FOCUS SEARCH ------------------ */

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    }
  }, [open]);

  /* ------------------ KEYBOARD ------------------ */

  const onKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }

    if (e.key === "Escape") {
      closeMenu();
    }
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div
      ref={wrapperRef}
      className={`custom-select ${className} ${
        disabled ? "is-disabled" : ""
      }`}
      data-direction={direction}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={value?.value ?? ""}
          readOnly
        />
      )}

      {/* Control */}
      <button
        type="button"
        ref={buttonRef}
        className={`cs-control ${open ? "is-open" : ""}`}
        onClick={handleControlClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`cs-value ${
            value ? "has-value" : "is-placeholder"
          }`}
        >
          {value?.label ?? placeholder}
        </span>
      </button>

      {/* Menu */}
      <div
        className={`cs-menu ${open ? "menu-enter" : "menu-exit"}`}
        role="listbox"
        aria-hidden={!open}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Search */}
        <div className="cs-search-row">
          <input
            ref={searchRef}
            className="cs-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            inputMode="search"
          />
        </div>

        {/* Options */}
        <div className="cs-options">
          {filtered.length === 0 ? (
            <div className="cs-empty">No options</div>
          ) : (
            filtered.map((opt) => {
              const selected = value?.value === opt.value;

              return (
                <div
                  key={opt.value}
                  className={`cs-option ${
                    selected ? "is-selected" : ""
                  }`}
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
