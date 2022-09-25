import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

import { storage } from "./config";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// ============ FIRESTORE ============
function addDocument(collectionName, data) {
  addDoc(collection(db, collectionName), {
    ...data,
    createAt: serverTimestamp(),
  });
}

// ============ STORAGE ============
function uploadFile(fileUpload, folder, callback) {
  if (!fileUpload || folder.length === 0) return;
  const fileRef = ref(
    storage,
    `${folder}/${fileUpload.lastModified}_${fileUpload.size}_${uuidv4()}_${
      fileUpload.name
    }`
  );

  uploadBytes(fileRef, fileUpload).then((snapshot) => {
    // Get URL
    getDownloadURL(snapshot.ref).then((url) => {
      callback(url, snapshot.metadata.fullPath);
    });
  });
}

function deleteFile(fullPath) {
  const desertRef = ref(storage, fullPath);

  // Delete the file
  deleteObject(desertRef)
    .then(() => {
      // File deleted successfully
    })
    .catch((error) => {
      console.error(error);
    });
}

export { addDocument, uploadFile, deleteFile };
