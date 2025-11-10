import React, { useState } from "react";
import Select from "react-select";
import "./PostUploadModal.css";
import { BeatLoader } from "react-spinners";
import MultiSelectTags from "../utils/MultiSelectTags";

const DiscussionUploadModal = ({ isOpen, onClose, onCreate }) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Write something to start a discussion.");
      return;
    }
    setLoading(true);
    try {
      const tagList = tags.map((t) => t.value);
      await onCreate(content.trim(), visibility, tagList);
      setContent("");
      setTags([]);
      setVisibility("public");
      onClose();
    } catch (err) {
      console.error("Failed to create discussion", err);
      alert("Could not create discussion. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = [
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food" },
    { value: "tech", label: "Tech" },
    { value: "fashion", label: "Fashion" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "nature", label: "Nature" },

    // Student tags
    { value: "stem-student", label: "STEM Student" },
    { value: "humanities-student", label: "Humanities Student" },
    { value: "arts-design-student", label: "Arts & Design" },
    {
      value: "business-entrepreneurship-student",
      label: "Business & Entrepreneurship",
    },
    { value: "innovation-startups-student", label: "Innovation & Startups" },
    {
      value: "sustainability-social-impact-student",
      label: "Sustainability & Social Impact",
    },
    { value: "hackathons-competitions", label: "Hackathons / Competitions" },
    { value: "internships", label: "Internships" },
    { value: "volunteering", label: "Volunteering" },

    // Faculty / professional tags
    { value: "stem-faculty", label: "STEM Faculty" },
    { value: "humanities-faculty", label: "Humanities Faculty" },
    { value: "arts-design-faculty", label: "Arts & Design Faculty" },
    { value: "business-management", label: "Business & Management" },
    { value: "research-supervisor", label: "Research Supervisor" },
    { value: "grant-recipient", label: "Grant Recipient" },
    { value: "industry-collaboration", label: "Industry Collaboration" },
    { value: "conference-speaker", label: "Conference Speaker" },
    { value: "editorial-board-member", label: "Editorial Board Member" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="profup-1">
          <h3>Start a Discussion</h3>
          <span onClick={onClose}>✕</span>
        </div>

        <div style={{ padding: "1rem" }}>
          <textarea
            className="post-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thought..."
            style={{
              width: "100%",
              minHeight: "150px",
              //   resize: "vertical",
              padding: "12px",
              fontSize: 15,
            }}
            maxLength={5000}
          />

          <div style={{ marginTop: "12px" }}>
            {/* <div className="selected-tags">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span key={tag.value} className="tag-chip">
                    {tag.label}
                  </span>
                ))
              ) : (
                <p className="no-tags">No tags selected</p>
              )}
            </div> */}
            {/* <label style={{ fontWeight: 500 }}>Tags (up to 7)</label> */}
            {/* <Select
              isMulti
              options={tagOptions}
              value={tags}
              onChange={setTags}
              placeholder="Add related topics"
              isOptionDisabled={() => tags.length >= 7}
              className="post-select"
              controlShouldRenderValue={false}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              styles={{
                container: (base) => ({
                  ...base,
                  width: 250, // fixed width
                  minWidth: 250, // ensures it doesn't shrink below 250px
                  maxWidth: 250, // ensures it doesn't grow beyond 250px
                }),
                control: (base) => ({
                  ...base,
                  width: "100%", // fill container width
                }),
                menu: (base) => ({
                  ...base,
                  width: 250, // match container width
                  marginTop: 4,
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                  width: 250, // match container width
                }),
                multiValue: (base) => ({
                  ...base,
                  maxWidth: "100%",
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: "220px",
                  overflowY: "auto",
                  paddingRight: 6,
                }),
              }}
            /> */}
            <MultiSelectTags
              value={tags}
              options={tagOptions}
              onChange={setTags}
              placeholder="Select up to 7 tags"
            />
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "8px 0",
              }}
              title="If checked, this post will only be visible to students of your university"
            >
              <span className="uni-1">University</span>

              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={visibility === "university"}
                  onChange={(e) =>
                    setVisibility(e.target.checked ? "university" : "public")
                  }
                />
                <span className="slider" />
              </div>
            </label>

            <div style={{ marginTop: "12px", display: "flex", gap: 8 }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="post-button"
              >
                {loading ? (
                  <BeatLoader size={10} color="#ffffff" />
                ) : (
                  "Post Discussion"
                )}
              </button>
            </div>
            {/* <button
              onClick={onClose}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionUploadModal;
