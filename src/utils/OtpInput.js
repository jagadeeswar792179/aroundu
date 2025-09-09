import React, { useRef, useState, useEffect } from "react";
import "./OtpInput.css";
import { MdVerified } from "react-icons/md";
/**
 * Props:
 *  - length (number) default 6
 *  - value (string) optional controlled value
 *  - onChange (string) called on any change with full value
 *  - onComplete (string) called when all digits filled
 *  - autoFocus (bool)
 *  - allowedChars (regex string) default "\\d" (digits only)
 */
export default function OtpInput({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  autoFocus = true,
  allowedChars = "\\d",
}) {
  const [value, setValue] = useState(() =>
    (controlledValue ?? "").slice(0, length).padEnd(length, "")
  );
  const inputsRef = useRef([]);

  // keep controlled/uncontrolled in sync
  useEffect(() => {
    if (controlledValue !== undefined) {
      const v = (controlledValue ?? "").slice(0, length);
      setValue(v.padEnd(length, ""));
    }
  }, [controlledValue, length]);

  useEffect(() => {
    // optionally autofocus first empty
    if (autoFocus) {
      const firstEmpty = value.split("").findIndex((ch) => ch === "");
      const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
      inputsRef.current[idx]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = (newVal) => {
    setValue(newVal);
    if (onChange) onChange(newVal.replace(/\s/g, ""));
    if (!newVal.includes("") && newVal.length === length && onComplete) {
      onComplete(newVal);
    }
  };

  const handleInput = (e, idx) => {
    const ch = e.target.value;
    const allowed = new RegExp(allowedChars);
    if (ch === "") {
      // user cleared the field
      const arr = value.split("");
      arr[idx] = "";
      emitChange(arr.join(""));
      return;
    }
    // take last char typed (to support mobile keyboards)
    const last = ch.slice(-1);
    if (!allowed.test(last)) return; // ignore invalid char

    const arr = value.split("");
    arr[idx] = last;
    emitChange(arr.join(""));

    // move focus to next
    const next = Math.min(length - 1, idx + 1);
    inputsRef.current[next]?.focus();
    inputsRef.current[next]?.select?.();
  };

  const handleKeyDown = (e, idx) => {
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[idx]) {
        // clear current
        arr[idx] = "";
        emitChange(arr.join(""));
        inputsRef.current[idx]?.focus();
      } else {
        // move to previous and clear
        const prev = Math.max(0, idx - 1);
        arr[prev] = "";
        emitChange(arr.join(""));
        inputsRef.current[prev]?.focus();
      }
      return;
    }

    if (key === "ArrowLeft") {
      e.preventDefault();
      const prev = Math.max(0, idx - 1);
      inputsRef.current[prev]?.focus();
      return;
    }

    if (key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(length - 1, idx + 1);
      inputsRef.current[next]?.focus();
      return;
    }

    // allow digits via keypress — default behavior handled in onChange
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const allowed = new RegExp(allowedChars, "g");
    const filtered = (paste.match(allowed) || []).slice(0, length);
    if (filtered.length === 0) return;
    const merged = filtered.join("").padEnd(length, "");
    emitChange(merged);
    // focus next empty or last filled
    const firstEmpty = merged.split("").findIndex((ch) => ch === "");
    const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
    inputsRef.current[idx]?.focus();
  };

  return (
    <>
      <div className="otp-div">
        <p>Enter otp</p>

        <div
          className="otp-root"
          role="group"
          aria-label={`${length}-digit OTP`}
        >
          {Array.from({ length }).map((_, i) => {
            const ch = value[i] ?? "";
            return (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                inputMode="numeric"
                pattern={allowedChars}
                maxLength={length}
                value={ch}
                onChange={(e) => handleInput(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                className="otp-input"
                aria-label={`OTP digit ${i + 1}`}
                autoComplete="one-time-code"
              />
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <MdVerified style={{ color: "green", fontSize: "24px" }} />
          <p>Verified</p>
        </div>
      </div>
    </>
  );
}
