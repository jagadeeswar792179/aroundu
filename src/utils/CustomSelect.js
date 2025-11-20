import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const menuRef = useRef(null);

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

  // Select an option
  const handleSelect = (opt) => {
    onChange(opt);
    // For single-select we usually close:
    closeMenu();
    // focus back to the "input"
    inputRef.current?.focus();
  };

  // Toggle on control click
  const handleControlClick = () => {
    if (open) closeMenu();
    else openMenu();
  };

  // ✅ Close on outside *mouse* click
  // ❌ No touch-based outside close
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e) => {
      const wr = wrapperRef.current;
      if (wr && !wr.contains(e.target)) {
        // closeMenu();
      }
    };

    document.addEventListener("mousedown", onMouseDown, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [open, closeMenu]);

  // ✅ Close on scroll (inside OR outside)
  // ❌ No touchmove-based close
  useEffect(() => {
    if (!open) return;

    const onWheel = () => {
      // any wheel scroll closes menu
      // closeMenu();
    };

    const onWindowScroll = () => {
      // any window scroll closes menu
      // closeMenu();
    };

    document.addEventListener("wheel", onWheel, {
      passive: true,
      capture: true,
    });
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      document.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [open, closeMenu]);

  // Keyboard basics
  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setOpen((v) => !v);
    } else if (e.key === "Escape") {
      closeMenu();
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
        ref={menuRef}
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
                  // Mouse selection
                  // onMouseDown={(e) => {
                  //   e.preventDefault();
                  //   e.stopPropagation();
                  //   handleSelect(opt);
                  // }}
                  // ✅ Touch here is ONLY for selecting the option (inside),
                  //    not for global "touch close"
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter") {
                  //     e.preventDefault();
                  //     handleSelect(opt);
                  //   }
                  // }}
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
