import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

import { storage } from "./config";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

function addDocument(collectionName, data) {
  addDoc(collection(db, collectionName), {
    ...data,
    createAt: serverTimestamp(),
  });
}

function uploadFile(fileUpload, folder) {
  if (!fileUpload || folder.length === 0) return;
  const imageRef = ref(
    storage,
    `${folder}/${fileUpload.lastModified}_${fileUpload.size}_${uuidv4()}_${
      fileUpload.name
    }`
  );

  // uploadBytes(imageRef, fileUpload).then((snapshot) => {
  //   console.log("Image Uploaded!");
  //   // getDownloadURL(snapshot.ref).then((url) => {
  //   //   console.log("URL: ", url);
  //   // });
  //   return getDownloadURL(snapshot.ref);
  // });

  return uploadBytes(imageRef, fileUpload);
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
