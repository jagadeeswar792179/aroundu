// src/components/PostUploadModal.jsx
import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import Select from "react-select";
import "./PostUploadModal.css";
import MultiSelect from "../utils/MultiSelectTags";

const PostUploadModal = ({ isOpen, onClose, onPost }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [finalBlob, setFinalBlob] = useState(null);

  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [visibility, setVisibility] = useState("public"); // 'public' | 'university'

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

  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

 const handleCropConfirm = async () => {
  const blob = await getCroppedImg(imageSrc, croppedAreaPixels, {
    maxWidth: 1080,
    maxHeight: 1350,
    quality: 0.75,
    mimeType: "image/jpeg",
  });
  setFinalBlob(blob);
};

  const handlePostClick = () => {
    if (!finalBlob) {
      alert("Please upload and crop an image first.");
      return;
    }

    // prepare tags array
    const tags = selectedTags.map((t) => t.value);

    // pass visibility as a 4th param
    onPost(finalBlob, caption, tags, visibility);

    // reset internal states (optional)
    setImageSrc(null);
    setFinalBlob(null);
    setCaption("");
    setSelectedTags([]);
    setVisibility("public");

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "400px" }}>
        <div className="profup-1">
          <h3>Create a Post</h3>
          <span onClick={onClose}>✕</span>
        </div>
        <div className="profup-2">
          {!imageSrc && (
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button onClick={handleClick} className="upload-btn">
                Upload Image
              </button>
            </div>
          )}

          {imageSrc && !finalBlob && (
            <>
              <div
                className="final-cropper-1
              "
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 5}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <button onClick={handleCropConfirm} className="upload-btn">
                Confirm Crop
              </button>
            </>
          )}

          {finalBlob && (
            <div className="profup-3">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={URL.createObjectURL(finalBlob)}
                  alt="Preview"
                  style={{
                    width: "300px",
                    height: "350px",
                    objectFit: "cover",
                    borderRadius: "30px",
                  }}
                />
                <button
                  onClick={() => setFinalBlob(null)}
                  className="upload-btn"
                >
                  Re-Crop
                </button>
              </div>

              <div className="post-box">
                <textarea
                  className="post-textarea"
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                />

                {/* Visibility option */}

                <MultiSelect
                  options={tagOptions}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select up to 15 tags"
                  maxSelected={15}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
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
                          setVisibility(
                            e.target.checked ? "university" : "public"
                          )
                        }
                      />
                      <span className="slider" />
                    </div>
                  </label>
                  <button className="post-button" onClick={handlePostClick}>
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostUploadModal;
