import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";

function useFirestore(collectionName, condition, callback, callbackError) {
  const [documents, setDocuments] = useState([]);
  const { uid } = useContext(AuthContext);

  useEffect(() => {
    if (condition) {
      if (!condition.compareValue || !condition.compareValue.length) {
        console.log("End useFirestore!");
        return;
      }
    }

    if (uid) {
      let collectionRef = collection(db, collectionName);

      const q = query(
        collectionRef,
        where(condition.fielName, condition.operator, condition.compareValue),
        orderBy("createAt")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Lặp qua snapshot để lấy mảng dữ liệu
          const documents = snapshot.docs.map((doc) => {
            let data = doc.data();
            let docId = doc.id;

            return {
              ...data,
              id: docId,
            };
          });

          if (typeof callback === "function") {
            callback();
          }
          setDocuments(documents);
        },
        (error) => {
          console.error({
            error,
            erorCode: error.code,
            errorMsg: error.message,
          });
          if (typeof callbackError === "function") {
            callbackError(error);
          }
        }
      );

      // Cleanup function
      return () => {
        console.log("Clean up useFirestore: ", collectionName);
        unsubscribe();
      };
    }
  }, [collectionName, condition, uid, callback, callbackError]);

  return documents;
}

export default useFirestore;
