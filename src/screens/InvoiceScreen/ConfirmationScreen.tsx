import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useAuth } from "../../context/AuthProvider";
import { useDispatch } from "react-redux";
import { setCurrentInvoice, setCustomer } from "../../redux/MySlice";
import { invoiceService } from "../../services/firestore";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { useNetwork } from "../../context/NetworkProvider";
import { offlineStorage } from "../../services/offlineStorage";

const ConfirmationScreen = ({ route, navigation }: any) => {
  const {
    formData,
    selectedCustomer,
    currentInvoice,
    taxValue,
    discountValue,
    totals,
  } = route.params;

  const { isConnected } = useNetwork();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();

  const handleConfirmInvoice = async () => {
    setLoading(true);

    const invoiceData = {
      formData,
      selectedCustomer,
      currentInvoice,
      taxValue,
      discountValue,
      totals,
    };

    try {
      if (!isConnected) {
        const pendingInvoice = await offlineStorage.savePendingInvoice(
          user.uid,
          invoiceData
        );
        toast(
          "success",
          "Saved Offline",
          "Invoice saved locally. Will sync when online."
        );
        dispatch(setCustomer(null));
        dispatch(setCurrentInvoice(null));

        navigation.navigate("InvoiceDetail", {
          invoice: {
            ...invoiceData,
            invoiceNumber: "PENDING",
            createdAt: { seconds: Math.floor(Date.now() / 1000) }, // Mock Firestore timestamp
            id: pendingInvoice.localId,
          },
          fromConfirmation: true,
        });
      } else {
        const savedInvoice = await invoiceService.createInvoice(
          user.uid,
          invoiceData
        );

        if (savedInvoice) {
          toast(
            "success",
            "Success",
            `Invoice ${savedInvoice.invoiceNumber} created!`
          );
          dispatch(setCustomer(null));
          dispatch(setCurrentInvoice(null));

          navigation.navigate("InvoiceDetail", {
            invoiceId: savedInvoice.id,
            fromConfirmation: true,
          });
        } else {
          toast("error", "Error", "Invoice creation failed");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast("error", "Error", error.message);
      } else {
        toast("error", "Error", "Invoice creation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Invoice Preview</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* FROM */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>From</Text>
          </View>
          <Text style={styles.detailLabel}>{formData.companyName}</Text>
          <Text style={styles.detailText}>{formData.fullName}</Text>
          <Text style={styles.detailText}>{formData.phoneNumber}</Text>
          <Text style={styles.detailText}>{formData.dispatchAddress}</Text>
        </View>

        {/* BILL TO */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Bill To</Text>
          </View>
          <Text style={styles.detailLabel}>{selectedCustomer.name}</Text>
          <Text style={styles.detailText}>{selectedCustomer.companyName}</Text>
          <Text style={styles.detailText}>{selectedCustomer.email}</Text>
          <Text style={styles.detailText}>{selectedCustomer.phone}</Text>
          <Text style={styles.detailText}>
            {selectedCustomer.billingAddress || "No address provided"}
          </Text>
        </View>

        {/* ITEMS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Items</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Item</Text>
            <Text style={styles.tableHeaderText}>Qty</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>Total</Text>
          </View>

          <FlatList
            data={currentInvoice.items}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={styles.tableCell}>₹{item.price}</Text>
                <Text style={styles.tableCell}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            )}
          />
        </View>

        {/* SUMMARY */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calculator" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Summary</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{totals.subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Discount ({discountValue}%):
            </Text>
            <Text style={styles.summaryValue}>-₹{totals.discountAmount}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({taxValue}%):</Text>
            <Text style={styles.summaryValue}>+₹{totals.taxAmount}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.totalValue}>₹{totals.grandTotal}</Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={loading}
            style={[
              styles.button,
              styles.editButton,
              loading && styles.disabledEdit,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Edit Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            onPress={handleConfirmInvoice}
            style={[
              styles.button,
              styles.confirmButton,
              loading && styles.disabledConfirm,
            ]}
          >
            <Text style={styles.confirmButtonText}>Confirm & Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    color: colors.white,
    fontSize: size(24),
    fontFamily: fonts.poppinsBold,
    textAlign: "center",
  },
  content: {
    padding: 20,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: size(18),
    fontFamily: fonts.poppinsBold,
    marginLeft: 8,
    color: colors.neutralText,
  },
  detailLabel: {
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
    color: colors.neutralText,
    marginBottom: 4,
  },
  detailText: {
    fontSize: size(14),
    color: colors.textSecondary,
    marginBottom: 8,
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray100,
    borderRadius: 8,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.poppinsBold,
    color: colors.textSecondary,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: size(14),
  },
  summaryValue: {
    color: colors.neutralText,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    color: colors.neutralText,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
  },
  totalValue: {
    color: colors.primary,
    fontSize: size(18),
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  editButton: {
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  disabledEdit: {
    backgroundColor: colors.border,
  },

  confirmButton: {
    backgroundColor: colors.primary,
  },
  disabledConfirm: {
    backgroundColor: colors.bluishgray,
  },

  buttonText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.neutralText,
  },
  confirmButtonText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.white,
  },
});

export default ConfirmationScreen;
