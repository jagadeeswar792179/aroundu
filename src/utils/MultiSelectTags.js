import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./MultiSelectTags.css";
/**
 * MultiSelect
 * props:
 *  - options: [{value, label}]
 *  - value:   [{value, label}]
 *  - onChange: (arr) => void
 *  - placeholder?: string
 *  - maxSelected?: number (default 7)
 *  - className?: string (extra class on root)
 */
export default function MultiSelectTags({
  options = [],
  value = [],
  onChange = () => {},
  placeholder = "Select...",
  maxSelected = 7,
  className = "",
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false); // controls portal mount
  const [menuOpen, setMenuOpen] = useState(false); // controls animation class
  const [closedByScroll, setClosedByScroll] = useState(false);

  // track tags playing "remove" animation: Set<value>
  const [removing, setRemoving] = useState(() => new Set());

  // compute options not yet selected
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

  // ===== Menu positioning (fixed, above input, width = input width) =====
  const [menuStyle, setMenuStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
  });

  const positionMenu = () => {
    if (!inputRef.current) return;
    const r = inputRef.current.getBoundingClientRect();
    setMenuStyle({
      left: Math.max(8, r.left), // small padding against viewport edge
      top: r.top, // anchor at input top; CSS translates up
      width: r.width,
    });
  };

  // Open / Close with animation
  const openMenu = () => {
    positionMenu();
    setMenuVisible(true);
    // next frame -> play in animation
    requestAnimationFrame(() => setMenuOpen(true));
  };

  const closeMenu = () => {
    setMenuOpen(false);
    // let closing animation finish
    setTimeout(() => setMenuVisible(false), 160);
  };

  // focus opens menu (unless already open)
  const handleFocus = () => {
    if (!menuVisible) openMenu();
  };

  // Select option
  const handleSelect = (opt) => {
    if (value.length >= maxSelected) return; // hard cap
    const next = [...value, opt];
    onChange(next);
    // keep menu open for faster multiple selections
    setQuery("");
  };

  // Remove tag with exit animation
  const handleRemove = (tag) => {
    setRemoving((prev) => new Set(prev).add(tag.value));
  };

  const onTagAnimationEnd = (tag) => {
    if (!removing.has(tag.value)) return;
    const next = value.filter((v) => v.value !== tag.value);
    onChange(next); // immediately makes it appear back in menu
    setRemoving((prev) => {
      const n = new Set(prev);
      n.delete(tag.value);
      return n;
    });
  };

  // Outside click to close
  useEffect(() => {
    const onPointerDown = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const clickedInsideMenu =
        menuRef.current && path.includes(menuRef.current);
      const clickedInsideRoot =
        rootRef.current && path.includes(rootRef.current);

      if (!clickedInsideMenu && !clickedInsideRoot) {
        // Outside completely
        if (menuVisible) {
          setClosedByScroll(false);
          closeMenu();
        }
      }
    };

    // capture so outside interactions still work
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [menuVisible]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && menuVisible) {
        setClosedByScroll(false);
        closeMenu();
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuVisible]);

  // Reposition on resize
  useEffect(() => {
    const onResize = () => {
      if (menuVisible) positionMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuVisible]);

  // Scroll handling:
  // - If scrolling happens OUTSIDE menu, close (and mark closedByScroll)
  // - Scrolling INSIDE menu should NOT close
  // - After scroll ends (debounced), if input is still focused, reopen
  useEffect(() => {
    let reopenTimer = null;
    let debounceTimer = null;

    const maybeReopen = () => {
      if (document.activeElement === inputRef.current) {
        positionMenu();
        setClosedByScroll(false);
        openMenu();
      }
    };

    const markScrollEnd = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (closedByScroll) {
          // reopen softly after scroll settles
          maybeReopen();
        }
      }, 180);
    };

    // capture scrolls on any element
    const onAnyScroll = (e) => {
      // if the scroll target (or its path) is the menu, ignore
      const path = e.composedPath ? e.composedPath() : [];
      const insideMenu = menuRef.current && path.includes(menuRef.current);

      // also ignore if the root/input area is scrolling itself
      const insideRoot = rootRef.current && path.includes(rootRef.current);

      if (!insideMenu && !insideRoot) {
        if (menuVisible) {
          setClosedByScroll(true);
          closeMenu();
        }
      }
      markScrollEnd();
    };

    // wheel and touchmove help on some browsers
    const onAnyWheelOrTouch = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const insideMenu = menuRef.current && path.includes(menuRef.current);
      const insideRoot = rootRef.current && path.includes(rootRef.current);
      if (!insideMenu && !insideRoot) {
        if (menuVisible) {
          setClosedByScroll(true);
          closeMenu();
        }
      }
      markScrollEnd();
    };

    document.addEventListener("scroll", onAnyScroll, true);
    document.addEventListener("wheel", onAnyWheelOrTouch, {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", onAnyWheelOrTouch, {
      passive: true,
      capture: true,
    });

    return () => {
      clearTimeout(reopenTimer);
      clearTimeout(debounceTimer);
      document.removeEventListener("scroll", onAnyScroll, true);
      document.removeEventListener("wheel", onAnyWheelOrTouch, true);
      document.removeEventListener("touchmove", onAnyWheelOrTouch, true);
    };
  }, [menuVisible, closedByScroll]);

  // Keep menu width synced while open
  useEffect(() => {
    if (!menuVisible) return;
    const ro = new ResizeObserver(positionMenu);
    if (inputRef.current) ro.observe(inputRef.current);
    return () => ro.disconnect();
  }, [menuVisible]);

  const disableInput = value.length >= maxSelected;

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
            if (!menuVisible) openMenu();
          }}
          onFocus={handleFocus}
          onClick={() => {
            if (!menuVisible) openMenu();
          }}
          disabled={disableInput}
          autoComplete="off"
          inputMode="text"
        />
      </div>

      {/* Selected tags BELOW the input */}
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

      {/* MENU (portal, fixed, above input) */}
      {menuVisible &&
        createPortal(
          <div
            ref={menuRef}
            className={`ms-menu ${
              menuOpen ? "ms-menu--open" : "ms-menu--closing"
            }`}
            style={{
              position: "fixed",
              left: `${menuStyle.left}px`,
              top: `${menuStyle.top}px`,
              width: `${menuStyle.width}px`,
            }}
            // prevent internal scrolls from propagating outward
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
                    onMouseDown={(e) => e.preventDefault()} // keep focus on input
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
