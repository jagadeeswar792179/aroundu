import React, { useRef, useState, useCallback } from "react";
import "./custom-select.css";

export default function CustomSelect({
  options = [],
  value = null, // { value, label } or null
  onChange = () => {},
  placeholder = "Select...",
  disabled = false,
  direction = "down", // "up" | "down"
  name, // optional for forms
  className = "", // extra classes for wrapper
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options by query (case-insensitive)
  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase())
      )
    : options;

  // Open/close handlers
  const openMenu = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery(""); // reset search on close
  }, []);

  // Select an option → close menu
  const handleSelect = (opt) => {
    onChange(opt);
    closeMenu();
    inputRef.current?.focus();
  };

  // Toggle on control click → open/close
  const handleControlClick = () => {
    if (open) closeMenu();
    else openMenu();
  };

  // Keyboard basics (only toggling, no extra closing logic)
  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((v) => !v); // toggle like click
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`custom-select ${className} ${disabled ? "is-disabled" : ""}`}
      data-direction={direction}
    >
      {/* Hidden native input for forms (optional) */}
      {name ? (
        <input type="hidden" name={name} value={value?.value ?? ""} readOnly />
      ) : null}

      {/* Control */}
      <button
        type="button"
        ref={inputRef}
        className={`cs-control ${open ? "is-open" : ""}`}
        onClick={handleControlClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`cs-value ${value ? "has-value" : "is-placeholder"}`}>
          {value?.label ?? placeholder}
        </span>
      </button>

      {/* Menu (overlay, absolute, matches control width) */}
      <div
        className={`cs-menu ${open ? "menu-enter" : "menu-exit"}`}
        role="listbox"
        aria-hidden={!open}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {/* Search inside menu */}
        <div className="cs-search-row">
          <input
            className="cs-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            inputMode="search"
          />
        </div>

        <div className="cs-options" role="presentation">
          {filtered.length === 0 ? (
            <div className="cs-empty">No options</div>
          ) : (
            filtered.map((opt) => {
              const selected = value?.value === opt.value;
              return (
                <div
                  key={opt.value}
                  className={`cs-option ${selected ? "is-selected" : ""}`}
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  // ONLY onClick closes by selecting
                  onClick={() => handleSelect(opt)}
                >
                  <span className="cs-option-label">{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
