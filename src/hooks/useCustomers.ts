import { useState, useEffect } from "react";
import {
  collection,
  getFirestore,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useAuth } from "../context/AuthProvider";
import { Customer } from "../services/types";

const db = getFirestore();

export const useCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const customersRef = collection(db, "users", user.uid, "customers");
    const unsubscribe = onSnapshot(
      customersRef,
      (snapshot) => {
        const customerList = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Customer[];
        setCustomers(customerList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { customers, loading };
};
