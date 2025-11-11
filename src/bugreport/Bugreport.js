import React, { useState } from "react";
import "./Bugreport.css";
import CustomSelect from "../utils/CustomSelect";

export default function Bugreport({ onClose }) {
  const [form, setForm] = useState({
    title: "",
    type: "other",
    description: "",
  });
  const server = process.env.REACT_APP_SERVER;
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem("token"); // must be set by your auth flow

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.title.trim() || !form.description.trim()) {
      setMsg({ type: "error", text: "Title and description are required." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${server}/api/bug-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(form),
      });

      if (res.status === 201) {
        const data = await res.json();
        setMsg({ type: "success", text: "Bug report submitted." });
        setForm({ title: "", type: "other", description: "" });
        // optional: you can keep data.id or show it to user
      } else {
        const body = await res.json().catch(() => null);
        setMsg({
          type: "error",
          text:
            (body && body.error) || `Failed to submit (status ${res.status})`,
        });
      }
    } catch (err) {
      console.error("submit bug error:", err);
      setMsg({ type: "error", text: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  };
  const TYPE_OPTIONS = [
    { value: "ui", label: "UI" },
    { value: "crash", label: "Crash" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="bugreport-container">
      <div className="bugreport-container-1">
        <h2>Submit Bug Report</h2>
        <button className="modal-closeBtn" onClick={onClose}>
          ✕
        </button>
      </div>
      <form className="bugreport-form" onSubmit={handleSubmit}>
        <label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Short descriptive title"
            required
            maxLength={200}
          />
        </label>

        <CustomSelect
          name="type"
          options={TYPE_OPTIONS}
          // The component expects {value,label} or null
          value={TYPE_OPTIONS.find((o) => o.value === form.type) || null}
          onChange={(opt) => {
            // keep your existing handleChange API
            handleChange({ target: { name: "type", value: opt.value } });
          }}
          placeholder="Select type"
          disabled={false}
          direction="down"
        />

        <label>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what happened..."
            required
          />
        </label>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {msg && (
        <div className={`bug-msg ${msg.type === "error" ? "err" : "ok"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
