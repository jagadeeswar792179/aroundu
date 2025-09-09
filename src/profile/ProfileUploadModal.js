// src/profile/ProfileUploadModal.js
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../Homepage/cropUtils"; // adjust path

const ProfileUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [finalBlob, setFinalBlob] = useState(null);
  const server = "https://aroundubackend.onrender.com";
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Upload Profile Picture</h2>

        {!imageSrc && (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        )}

        {imageSrc && !finalBlob && (
          <>
            <div
              style={{ position: "relative", width: "300px", height: "300px" }}
            >
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
            <button onClick={handleCropConfirm}>Confirm Crop</button>
          </>
        )}

        {finalBlob && (
          <div>
            <img
              src={URL.createObjectURL(finalBlob)}
              alt="Preview"
              style={{ width: 150, height: 150, borderRadius: "50%" }}
            />
            <button onClick={() => setFinalBlob(null)}>Re-Crop</button>
            <button onClick={handleUploadClick}>Save</button>
          </div>
        )}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ProfileUploadModal;
