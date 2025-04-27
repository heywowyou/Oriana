import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function generateRandomId(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function convertToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const maxDimension = 2000; // max width or height
      let { width, height } = img;

      // If bigger than maxDimension, resize while keeping aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          const ratio = maxDimension / width;
          width = maxDimension;
          height = height * ratio;
        } else {
          const ratio = maxDimension / height;
          height = maxDimension;
          width = width * ratio;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert image"));
          }
        },
        "image/jpeg",
        0.8 // 80% quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const randomId = generateRandomId(16);
  const convertedBlob = await convertToJpeg(file);
  const fileRef = ref(storage, `watched-covers/${randomId}.jpeg`);

  await uploadBytes(fileRef, convertedBlob);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
}
