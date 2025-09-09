// src/components/TimeAgo.jsx
import React from "react";

const TimeAgo = ({ timestamp }) => {
  if (!timestamp) return null;

  const created = new Date(
    timestamp.endsWith("Z") ? timestamp : timestamp + "Z"
  );
  const now = new Date();

  const diffMs = now - created;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  let result = "";

  if (diffSec < 60) {
    result = `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
  } else if (diffMin < 60) {
    result = `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else if (diffHr < 24) {
    result = `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    result = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else if (diffWeeks < 5) {
    result = `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  } else if (diffMonths < 12) {
    result = `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  } else {
    result = `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
  }

  return <small>{result}</small>;
};

export default TimeAgo;
