// src/utils/imageCropper.js

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

export async function getCroppedCompressedBlob(imageSrc, cropPixels, options) {
  const {
    outWidth = 1080,      // target width
    outHeight = 1080,     // target height
    quality = 0.82,       // 0..1
    mimeType = "image/jpeg", // "image/webp" also good
  } = options || {};

  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext("2d");

  // cropPixels are in original image pixels
  const sx = cropPixels.x;
  const sy = cropPixels.y;
  const sWidth = cropPixels.width;
  const sHeight = cropPixels.height;

  // draw cropped area into output size
  ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, outWidth, outHeight);

  // convert to blob (compressed)
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });

  return blob;
}