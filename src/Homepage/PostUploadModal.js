// src/components/PostUploadModal.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropUtils";
import Select from "react-select";
import "./PostUploadModal.css";
import { useRef } from "react";
const PostUploadModal = ({ isOpen, onClose, onPost }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [finalBlob, setFinalBlob] = useState(null);

  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const tagOptions = [
    { value: "travel", label: "Travel" },
    { value: "food", label: "Food" },
    { value: "tech", label: "Tech" },
    { value: "fashion", label: "Fashion" },
    { value: "fitness", label: "Fitness" },
    { value: "music", label: "Music" },
    { value: "nature", label: "Nature" },
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
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    setFinalBlob(blob);
  };

  const handlePostClick = () => {
    if (finalBlob) {
      onPost(
        finalBlob,
        caption,
        selectedTags.map((t) => t.value)
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: "700px" }}>
        <div className="profup-1">
          <h3>Create a Post</h3>
          <span onClick={onClose}>✕</span>
        </div>
        <div className="profup-2">
          {!imageSrc && (
            <div className="file-upload">
              {/* hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {/* custom button */}
              <button onClick={handleClick} className="upload-btn">
                Upload Image
              </button>
            </div>
          )}

          {imageSrc && !finalBlob && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "300px",
                  height: "300px",
                }}
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
              <div>
                <img
                  src={URL.createObjectURL(finalBlob)}
                  alt="Preview"
                  style={{
                    width: "300px",
                    height: "350px",
                    objectFit: "cover",
                    borderRadius: "10px",
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

                {/* Display selected tags as chips above */}
                <div className="selected-tags">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <span key={tag.value} className="tag-chip">
                        {tag.label}
                      </span>
                    ))
                  ) : (
                    <p className="no-tags">No tags selected</p>
                  )}
                </div>

                <Select
                  className="post-select"
                  isMulti
                  options={tagOptions}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select up to 7 tags"
                  isOptionDisabled={() => selectedTags.length >= 7}
                  controlShouldRenderValue={false} // 👈 hides selected inside input
                />

                <button className="post-button" onClick={handlePostClick}>
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostUploadModal;
