import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./custom-select.css";

/**
 * Props:
 * - options: Array<{ value: string|number, label: string }>
 * - value: { value, label } | null
 * - onChange: (option|null) => void
 * - placeholder?: string
 * - disabled?: boolean
 * - hideSelectedInMenu?: boolean (default true)
 * - className?: string (extra class on wrapper)
 */
export default function CustomSelect({
  options = [],
  value = null,
  onChange,
  placeholder = "Select…",
  disabled = false,
  hideSelectedInMenu = true,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [menuHeight, setMenuHeight] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Filter options by search and (optionally) hide selected
  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q)
    );
    return hideSelectedInMenu && value
      ? filtered.filter((o) => o.value !== value.value)
      : filtered;
  }, [options, query, value, hideSelectedInMenu]);

  // Position the menu above the input, matching its width
  const updateCoords = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({ top: rect.top, left: rect.left, width: rect.width });
  };

  // Measure menu height after it renders so we can place it above the input
  useLayoutEffect(() => {
    if (open && menuRef.current) {
      const h = menuRef.current.getBoundingClientRect().height;
      setMenuHeight(h);
    }
  }, [open, visibleOptions.length]);

  // Recalc on open and on resize
  useEffect(() => {
    if (open) updateCoords();
  }, [open]);

  useEffect(() => {
    const onResize = () => open && updateCoords();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Close on outside click/touch
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const w = wrapperRef.current;
      const m = menuRef.current;
      if (!w || !m) return;
      const target = e.target;
      if (!w.contains(target) && !m.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, {
      passive: true,
      capture: true,
    });
    return () => {
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
    };
  }, [open]);

  // Close on scroll OUTSIDE; keep open when scrolling inside menu
  useEffect(() => {
    if (!open) return;

    const closeOnScroll = () => setOpen(false);

    // We’ll close on window/page scroll…
    window.addEventListener("scroll", closeOnScroll, { passive: true });

    // …and on wheel/touchmove that happens *outside* the menu (we stop propagation inside)
    const wheelClose = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return; // ignore inside
      setOpen(false);
    };
    const touchMoveClose = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return; // ignore inside
      setOpen(false);
    };

    document.addEventListener("wheel", wheelClose, { passive: true });
    document.addEventListener("touchmove", touchMoveClose, { passive: true });

    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      document.removeEventListener("wheel", wheelClose);
      document.removeEventListener("touchmove", touchMoveClose);
    };
  }, [open]);

  // Prevent wheel/touchmove from bubbling when inside menu (so outside scroll handler won't fire)
  const stopInsideScroll = (e) => {
    e.stopPropagation();
  };

  // Toggle open and focus input
  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setHoverIndex(-1);
    // Make sure coords are fresh before focusing
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const closeMenu = () => setOpen(false);

  // Handle selection
  const selectOption = (opt) => {
    onChange?.(opt);
    setQuery(opt?.label ?? "");
    closeMenu();
  };

  // Keep input text synced with selected value when cleared manually
  useEffect(() => {
    if (!open) {
      // When menu is closed, show selected label in input (or empty)
      setQuery(value?.label ?? "");
    }
  }, [value, open]);

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHoverIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHoverIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = visibleOptions[hoverIndex] ?? visibleOptions[0];
      if (chosen) selectOption(chosen);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  // Compute absolute position for the menu ABOVE input
  const menuStyle = {
    position: "fixed",
    top: Math.max(0, coords.top - menuHeight - 8),
    left: coords.left,
    width: coords.width,
    zIndex: 9999,
  };

  return (
    <div
      ref={wrapperRef}
      className={`cs-wrapper ${className}`}
      data-disabled={disabled ? "true" : "false"}
    >
      <div className="cs-control" onClick={open ? undefined : openMenu}>
        <input
          ref={inputRef}
          className="cs-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setHoverIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => !open && openMenu()}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="cs-caret"
          aria-label="Toggle menu"
          onClick={() => (open ? closeMenu() : openMenu())}
          disabled={disabled}
        >
          ▴
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className={`cs-menu ${open ? "cs-menu-open" : ""}`}
            style={menuStyle}
            ref={menuRef}
            onWheel={stopInsideScroll}
            onTouchMove={stopInsideScroll}
          >
            {visibleOptions.length === 0 ? (
              <div className="cs-empty">No options</div>
            ) : (
              <ul className="cs-options" role="listbox">
                {visibleOptions.map((opt, idx) => (
                  <li
                    key={opt.value}
                    className={`cs-option ${
                      idx === hoverIndex ? "cs-option-hover" : ""
                    }`}
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseDown={(e) => e.preventDefault()} // prevent input blur before onClick
                    onClick={() => selectOption(opt)}
                    role="option"
                    aria-selected={
                      value?.value === opt.value ? "true" : "false"
                    }
                    title={opt.label}
                  >
                    <span className="cs-option-label">{opt.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
