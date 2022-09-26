import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthProvider";

function useGetAllFirestore(collectionName) {
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

          setDocuments(documents);
        },
        (error) => {
          console.error(error);
          // alert(
          //   "Thông báo: Hiện tại ứng dụng đã hết lượt truy cập. Vui lòng thử lại sau 😵‍💫"
          // );
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [collectionName, uid]);

  return documents;
}

export default useGetAllFirestore;
