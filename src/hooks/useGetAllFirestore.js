import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";

function useGetAllFirestore(collectionName, callback, callbackError) {
  const [documents, setDocuments] = useState([]);
  const { uid } = useContext(AuthContext);

  useEffect(() => {
    if (uid) {
      const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const documents = snapshot.docs.map((doc) => {
            let docData = doc.data();
            let docId = doc.id;
            return {
              ...docData,
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

      return () => {
        unsubscribe();
      };
    }
  }, [collectionName, uid, callback, callbackError]);

  return documents;
}

export default useGetAllFirestore;
