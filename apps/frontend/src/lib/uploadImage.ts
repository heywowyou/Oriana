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

export async function uploadImage(file: File): Promise<string> {
  const randomId = generateRandomId(20);
  const extension = file.name.split(".").pop(); // get file extension like jpg, png
  const fileRef = ref(storage, `watched-covers/${randomId}.${extension}`);

  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
}
