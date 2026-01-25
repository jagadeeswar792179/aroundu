import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedCompressedBlob } from "../utils/imageCropper";

function getAspectPreset(name) {
  switch (name) {
    case "square":
      return 1 / 1; // 1:1
    case "portrait":
      return 4 / 5; // 4:5 (instagram)
    case "landscape":
      return 16 / 9;
    default:
      return 1 / 1;
  }
}

export default function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onDone,
  preset = "square",
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const aspect = getAspectPreset(preset);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (!open) return null;

  const handleDone = async () => {
    if (!croppedAreaPixels) return;

    // choose output sizes based on preset
    const out =
      preset === "portrait"
        ? { outWidth: 1080, outHeight: 1350 }
        : preset === "landscape"
        ? { outWidth: 1280, outHeight: 720 }
        : { outWidth: 1080, outHeight: 1080 };

    const blob = await getCroppedCompressedBlob(imageSrc, croppedAreaPixels, {
      ...out,
      mimeType: "image/jpeg",
      quality: 0.82,
    });

    onDone(blob);
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={{ fontWeight: 600 }}>Crop & Compress</div>
          <button onClick={onClose} style={styles.btn}>X</button>
        </div>

        <div style={styles.cropArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={styles.controls}>
          <label>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <div style={styles.footer}>
            <button onClick={onClose} style={styles.btnSecondary}>
              Cancel
            </button>
            <button onClick={handleDone} style={styles.btnPrimary}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "min(720px, 92vw)",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
  },
  cropArea: {
    position: "relative",
    width: "100%",
    height: 420,
    background: "#111",
  },
  controls: {
    padding: 12,
    display: "grid",
    gap: 10,
  },
  footer: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  btn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
  },
  btnSecondary: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
};