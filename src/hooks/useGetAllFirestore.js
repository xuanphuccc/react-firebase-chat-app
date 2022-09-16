import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

import { useEffect, useState } from "react";

function useGetAllFirestore(collectionName) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => {
          return doc.data();
        });

        setDocuments(documents);
      },
      (error) => {
        console.error(error);
        alert(
          "Thông báo: Hiện tại ứng dụng đã hết lượt truy cập. Vui lòng thử lại sau 😵‍💫"
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName]);

  return documents;
}

export default useGetAllFirestore;
