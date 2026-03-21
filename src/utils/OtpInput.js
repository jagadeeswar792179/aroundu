// import React, { useRef, useState, useEffect } from "react";
// import "./OtpInput.css";
// import { MdVerified } from "react-icons/md";

// export default function OtpInput({
//   length = 6,
//   value: controlledValue,
//   onChange,
//   onComplete,
//   autoFocus = true,
//   allowedChars = "\\d",
//   verified = false, // new prop
// }) {
//   const [value, setValue] = useState(
//     (controlledValue ?? "").slice(0, length).padEnd(length, "")
//   );
//   const inputsRef = useRef([]);

//   useEffect(() => {
//     if (controlledValue !== undefined) {
//       const v = (controlledValue ?? "").slice(0, length);
//       setValue(v.padEnd(length, ""));
//     }
//   }, [controlledValue, length]);

//   useEffect(() => {
//     if (autoFocus) {
//       const firstEmpty = value.split("").findIndex((ch) => ch === "");
//       const idx = firstEmpty === -1 ? firstEmpty : length - 1;
//       inputsRef.current[idx]?.focus();
//     }
//   }, [autoFocus, value, length]);

// const emitChange = (newVal) => {
//   setValue(newVal);

//   const cleaned = newVal.replace(/\s/g, "");

//   if (onChange) onChange(cleaned);

//   if (cleaned.length === length && onComplete) {
//     onComplete(cleaned);
//   }
// };

//   const handleInput = (e, idx) => {
//     const ch = e.target.value;
//     const allowed = new RegExp(allowedChars);
//     if (!ch) {
//       const arr = value.split("");
//       arr[idx] = "";
//       emitChange(arr.join(""));
//       return;
//     }

//     const last = ch.slice(-1);
//     if (!allowed.test(last)) return;

//     const arr = value.split("");
//     arr[idx] = last;
//     emitChange(arr.join(""));

//     const next = Math.min(length - 1, idx + 1);
//     inputsRef.current[next]?.focus();
//     inputsRef.current[next]?.select?.();
//   };

//   const handleKeyDown = (e, idx) => {
//     const key = e.key;
//     if (key === "Backspace") {
//       e.preventDefault();
//       const arr = value.split("");
//       if (arr[idx]) {
//         arr[idx] = "";
//         emitChange(arr.join(""));
//         inputsRef.current[idx]?.focus();
//       } else {
//         const prev = Math.max(0, idx - 1);
//         arr[prev] = "";
//         emitChange(arr.join(""));
//         inputsRef.current[prev]?.focus();
//       }
//     }
//     if (key === "ArrowLeft") {
//       e.preventDefault();
//       inputsRef.current[Math.max(0, idx - 1)]?.focus();
//     }
//     if (key === "ArrowRight") {
//       e.preventDefault();
//       inputsRef.current[Math.min(length - 1, idx + 1)]?.focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const paste = (e.clipboardData || window.clipboardData).getData("text");
//     const allowed = new RegExp(allowedChars, "g");
//     const filtered = (paste.match(allowed) || []).slice(0, length);
//     if (filtered.length === 0) return;
//     const merged = filtered.join("").padEnd(length, "");
//     emitChange(merged);
//     const firstEmpty = merged.split("").findIndex((ch) => ch === "");
//     const idx = firstEmpty === -1 ? length - 1 : firstEmpty;
//     inputsRef.current[idx]?.focus();
//   };

//   return (
//     <div className="otp-div">
//       <p>Enter OTP</p>
//       <div className="otp-root" role="group" aria-label={`${length}-digit OTP`}>
//         {Array.from({ length }).map((_, i) => (
//           <input
//             key={i}
//             ref={(el) => (inputsRef.current[i] = el)}
//             inputMode="numeric"
//             pattern={allowedChars}
//             maxLength={1}
//             value={value[i] ?? ""}
//             onChange={(e) => handleInput(e, i)}
//             onKeyDown={(e) => handleKeyDown(e, i)}
//             onPaste={handlePaste}
//             className="otp-input"
//             aria-label={`OTP digit ${i + 1}`}
//             autoComplete="one-time-code"
//             disabled={verified} // disable if already verified
//           />
//         ))}
//       </div>
//       {verified && (
//         <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
//           <MdVerified style={{ color: "green", fontSize: "24px" }} />
//           <p>Verified</p>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
import "./OtpInput.css";
import { MdVerified } from "react-icons/md";

export default function OtpInput({
  length = 6,
  onChange,
  onComplete,
  verified = false,
}) {

  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const updateOtp = (arr) => {
    setOtp(arr);

    const code = arr.join("");

    if (onChange) onChange(code);

    if (code.length === length && !arr.includes("")) {
      onComplete?.(code);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");

    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    updateOtp(newOtp);

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace") {

      const newOtp = [...otp];

      if (newOtp[index]) {
        newOtp[index] = "";
        updateOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }

    }

  };

  const handlePaste = (e) => {

    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length)
      .split("");

    if (!pasted.length) return;

    const newOtp = Array(length).fill("");

    pasted.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    updateOtp(newOtp);

    const nextIndex = pasted.length < length ? pasted.length : length - 1;
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="otp-div">

      <p>Enter OTP</p>

      <div className="otp-root">

        {otp.map((digit, i) => (

          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="otp-input"
            value={digit}
            maxLength={1}
            inputMode="numeric"
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            disabled={verified}
          />

        ))}

      </div>

      {verified && (

        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <MdVerified style={{ color: "green", fontSize: "22px" }} />
          <span>Verified</span>
        </div>

      )}

    </div>
  );
}