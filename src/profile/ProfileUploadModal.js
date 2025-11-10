// src/profile/ProfileUploadModal.js
import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../Homepage/cropUtils"; // adjust path

const ProfileUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [finalBlob, setFinalBlob] = useState(null);
  const server = process.env.REACT_APP_SERVER;
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

  const handleUploadClick = async () => {
    if (!finalBlob) return;

    const formData = new FormData();
    formData.append("profile_pic", finalBlob, "profile.jpg");

    try {
      // Upload profile pic
      const res = await fetch(`${server}/api/user/upload-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      const data = await res.json();

      if (data.key) {
        // Get presigned URL for display
        const urlRes = await fetch(
          `${server}/api/user/profile-url?key=${data.key}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const { url } = await urlRes.json();

        // pass new URL up to parent (Profile.js)
        onUploaded(url);
      }

      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };
  const fileInputRef = useRef(null);
  const handleClick = () => {
    fileInputRef.current.click();
  };
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="profup-1 flex-r center-c">
          <h3>Upload Profile Picture</h3>
          <span onClick={onClose}>✕</span>
        </div>
        <div className="flex-c center-c">
          <br />
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
              <div className="final-cropper-1">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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
            <div>
              <img
                src={URL.createObjectURL(finalBlob)}
                alt="Preview"
                style={{ width: 150, height: 150, borderRadius: "50%" }}
              />
              <br />
              <button onClick={() => setFinalBlob(null)} className="upload-btn">
                Re-Crop
              </button>
              <button onClick={handleUploadClick} className="post-btn">
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileUploadModal;
