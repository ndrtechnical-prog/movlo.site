import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

async function compressImageToWebP(file: File, maxWidth = 1400, quality = 0.84): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const targetW = Math.round(img.width * scale);
      const targetH = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read selected image file."));
    };

    img.src = objectUrl;
  });
}

export async function uploadEditorialImage(file: File, slugHint = "article"): Promise<string> {
  const compressed = await compressImageToWebP(file);
  const safeSlug = slugHint.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 60) || "media";
  const path = `editorial/${safeSlug}-${Date.now()}.webp`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, compressed, {
    contentType: compressed.type || "image/webp",
    cacheControl: "public, max-age=31536000"
  });

  return getDownloadURL(storageRef);
}
