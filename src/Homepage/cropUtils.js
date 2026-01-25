// src/utils/cropImage.js
export default async function getCroppedImg(
  imageSrc,
  croppedAreaPixels,
  options = {}
) {
  const {
    maxWidth = 1080,     // Instagram-like max
    maxHeight = 1350,    // 4:5 max
    quality = 0.75,      // 0.6 - 0.85 good range
    mimeType = "image/jpeg", // or "image/webp"
  } = options;

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  const image = await createImage(imageSrc);

  // 1) Crop canvas (original crop size)
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = croppedAreaPixels.width;
  cropCanvas.height = croppedAreaPixels.height;

  const cropCtx = cropCanvas.getContext("2d");
  cropCtx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // 2) Compute resized output size (keep aspect ratio)
  const cropW = cropCanvas.width;
  const cropH = cropCanvas.height;

  const scale = Math.min(maxWidth / cropW, maxHeight / cropH, 1); // never upscale
  const outW = Math.round(cropW * scale);
  const outH = Math.round(cropH * scale);

  // 3) Resize canvas
  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;

  const outCtx = outCanvas.getContext("2d");
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  outCtx.drawImage(cropCanvas, 0, 0, cropW, cropH, 0, 0, outW, outH);

  // 4) Export compressed blob
  return new Promise((resolve) => {
    outCanvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}