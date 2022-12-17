import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

import { storage } from "./config";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// ============ FIRESTORE ============
function addDocument(collectionName, data, callback) {
  addDoc(collection(db, collectionName), {
    ...data,
    createAt: serverTimestamp(),
  })
    .then((data) => {
      if (typeof callback === "function") callback(data);
    })
    .catch((error) => {
      console.error(error);
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
  if (fullPath) {
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
}

function listAllFile(folder, callback) {
  const listRef = ref(storage, folder);

  listAll(listRef)
    .then((res) => {
      const listURL = [];
      let count = 0;
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          count = count + 1;
          listURL.push({ url, fullPath: item.fullPath });
          if (count === res.items.length) {
            callback(listURL);
            return;
          }
        });
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

export { addDocument, uploadFile, listAllFile, deleteFile };
