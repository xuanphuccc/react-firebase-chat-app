import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

function addDocument(collectionName, data) {
  addDoc(collection(db, collectionName), {
    ...data,
    createAt: serverTimestamp(),
  });
}

export { addDocument };
