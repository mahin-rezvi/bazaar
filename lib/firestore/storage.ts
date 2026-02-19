import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { getFirebaseClient } from "@/lib/firebase";

export async function uploadPublicImage({
  file,
  path,
}: {
  file: File;
  path: string;
}): Promise<string> {
  const { storage } = getFirebaseClient();
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return await getDownloadURL(objectRef);
}

