import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./MultiSelectTags.css";

/**
 * MultiSelectTags
 * props:
 *  - options: [{ value, label }]
 *  - value:   [{ value, label }]
 *  - onChange: (arr) => void
 *  - placeholder?: string
 *  - maxSelected?: number (default 7)
 *  - className?: string
 *  - direction?: "up" | "down" (default "up")
 */
export default function MultiSelectTags({
  options = [],
  value = [],
  onChange = () => {},
  placeholder = "Select...",
  maxSelected = 7,
  className = "",
  direction = "up", // "up" | "down"
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [removing, setRemoving] = useState(() => new Set());

  const [menuStyle, setMenuStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
  });

  // map of selected values for quick lookup
  const selectedMap = useMemo(() => {
    const m = new Map();
    value.forEach((v) => m.set(v.value, true));
    return m;
  }, [value]);

  const availableOptions = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return options
      .filter((opt) => !selectedMap.get(opt.value))
      .filter((opt) =>
        lower ? opt.label.toLowerCase().includes(lower) : true
      );
  }, [options, selectedMap, query]);

  const disableInput = value.length >= maxSelected;

  // Position menu relative to input, using document coordinates
  const positionMenu = () => {
    if (!inputRef.current) return;

    const r = inputRef.current.getBoundingClientRect();

    const scrollY =
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      0;
    const scrollX =
      window.scrollX ??
      window.pageXOffset ??
      document.documentElement.scrollLeft ??
      0;

    setMenuStyle({
      left: r.left + scrollX,
      top: r.top + scrollY, // anchor at input top, CSS will offset up/down
      width: r.width,
    });
  };

  const openMenu = () => {
    if (isOpen) return;
    positionMenu();
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSelect = (opt) => {
    if (value.length >= maxSelected) return;
    onChange([...value, opt]);
    setQuery(""); // clear query after selecting
  };

  const handleRemove = (tag) => {
    // trigger remove animation
    setRemoving((prev) => new Set(prev).add(tag.value));
  };

  const onTagAnimationEnd = (tag) => {
    if (!removing.has(tag.value)) return;
    const next = value.filter((v) => v.value !== tag.value);
    onChange(next);
    setRemoving((prev) => {
      const n = new Set(prev);
      n.delete(tag.value);
      return n;
    });
  };

  // Open on focus/click
  const handleInputFocus = () => {
    openMenu();
  };

  const handleInputClick = () => {
    openMenu();
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e) => {
      const path = e.composedPath ? e.composedPath() : [];

      const insideRoot = rootRef.current && path.includes(rootRef.current);
      const insideMenu = menuRef.current && path.includes(menuRef.current);

      if (!insideRoot && !insideMenu) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        closeMenu();
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Reposition on resize/scroll while open
  useEffect(() => {
    if (!isOpen) return;

    const onResize = () => positionMenu();
    const onScroll = () => positionMenu();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isOpen]);

  // Keep width synced if input size changes
  useEffect(() => {
    if (!isOpen) return;
    const ro = new ResizeObserver(positionMenu);
    if (inputRef.current) ro.observe(inputRef.current);
    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div ref={rootRef} className={`multi-select ${className}`}>
      <div className="ms-input-wrapper">
        <input
          ref={inputRef}
          className="ms-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) openMenu();
          }}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          disabled={disableInput}
          autoComplete="off"
          inputMode="text"
        />
      </div>

      {/* Tags below input */}
      <div className="ms-tags">
        {value.length > 0 ? (
          value.map((tag) => {
            const removingNow = removing.has(tag.value);
            return (
              <span
                key={tag.value}
                className={`ms-chip ${
                  removingNow ? "ms-chip--removing" : "ms-chip--in"
                }`}
                onAnimationEnd={() => onTagAnimationEnd(tag)}
              >
                <span className="ms-chip-label">{tag.label}</span>
                <button
                  type="button"
                  className="ms-chip-remove"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => handleRemove(tag)}
                >
                  x
                </button>
              </span>
            );
          })
        ) : (
          <p className="ms-no-tags"></p>
        )}
      </div>

      {/* Menu via portal */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={`ms-menu ms-menu--${direction} ${
              isOpen ? "ms-menu--open" : ""
            }`}
            style={{
              left: `${menuStyle.left}px`,
              top: `${menuStyle.top}px`,
              width: `${menuStyle.width}px`,
            }}
            onScroll={(e) => e.stopPropagation()}
          >
            <ul className="ms-options">
              {availableOptions.length === 0 ? (
                <li className="ms-no-options">No options</li>
              ) : (
                availableOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className="ms-option"
                    onMouseDown={(e) => e.preventDefault()} // keep focus
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="ms-option-label">{opt.label}</span>
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
