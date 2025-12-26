import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import { toast } from "../theme/toast";
import { useAuth } from "./AuthProvider";
import { offlineStorage } from "../services/offlineStorage";
import { invoiceService } from "../services/firestore";

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const retryTimeoutRef = useRef(null);
  const { user } = useAuth();

  const syncOfflineData = async () => {
    if (!user) return;

    try {
      const pendingInvoices = await offlineStorage.getPendingInvoices();
      if (pendingInvoices.length === 0) return;

      toast("info", "Syncing", "Syncing offline data...");

      let syncedCount = 0;
      for (const invoice of pendingInvoices) {
        // Ensure we only sync invoices for the current user
        if (invoice.userId === user.uid) {
          const result = await invoiceService.createInvoice(
            user.uid,
            invoice.data
          );
          if (result) {
            await offlineStorage.removePendingInvoice(invoice.localId);
            syncedCount++;
          }
        }
      }

      if (syncedCount > 0) {
        toast(
          "success",
          "Synced",
          `${syncedCount} offline invoice(s) synced successfully.`
        );
      }
    } catch (error) {
      console.error("Error syncing offline data:", error);
    }
  };

  const handleConnectionState = useCallback(
    (state, isManualRetry = false) => {
      const newIsConnected = state.isConnected;
      setIsConnected(newIsConnected);

      if (!newIsConnected) {
        toast(
          "error",
          "Connection Lost",
          "Checking again in 5 seconds...",
          "top",
          3000
        );

        retryTimeoutRef.current = setTimeout(() => {
          NetInfo.fetch().then((newState) => handleConnectionState(newState));
        }, 5000);
      } else {
        if (!isManualRetry) {
          toast("success", "Connected", "You are back online", "top", 5000);
        }
        // Trigger sync when back online
        syncOfflineData();
      }
    },
    [user]
  );

  const checkConnection = useCallback(
    (isManualRetry = false) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      NetInfo.fetch().then((state) =>
        handleConnectionState(state, isManualRetry)
      );
    },
    [handleConnectionState]
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected !== isConnected) {
        handleConnectionState(state);
      }
    });

    return () => {
      unsubscribe();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isConnected, handleConnectionState]);

  return (
    <NetworkContext.Provider value={{ isConnected, checkConnection }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => React.useContext(NetworkContext);
