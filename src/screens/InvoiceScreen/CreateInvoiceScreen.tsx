import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useAuth } from "../../context/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentInvoice, setCustomer } from "../../redux/MySlice";
import { Dropdown } from "react-native-element-dropdown";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { colors } from "../../theme/colors";
import { userDetailsService } from "../../services/firestore";
import { Customer, InvoiceItem, UserDetails } from "../../services/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

const MAX_TERMS = 5;

type Props = NativeStackScreenProps<RootStackParamList, "CreateInvoice">;

const CreateInvoiceScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<UserDetails>({
    dispatchAddress: "",
    terms: [],
    companyName: "",
    notes: "",
    fullName: "",
    phoneNumber: "",
  });

  const customer = useSelector((state: any) => state.MySlice.customer);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const currentInvoice = useSelector(
    (state: any) => state.MySlice.currentInvoice
  );

  const [taxValue, setTaxValue] = useState<number | string>(0);
  const [discountValue, setDiscountValue] = useState<number | string>(0);
  const [showCustomTax, setShowCustomTax] = useState(false);
  const [showCustomDiscount, setShowCustomDiscount] = useState(false);

  useEffect(() => {
    if (currentInvoice) {
      setTaxValue(currentInvoice.tax || 0);
      setDiscountValue(currentInvoice.discount || 0);
    }
  }, [currentInvoice]);

  const calculateTotals = () => {
    if (!currentInvoice) {
      return { subtotal: 0, discountAmount: 0, taxAmount: 0, grandTotal: 0 };
    }

    const subtotal = currentInvoice.items.reduce(
      (sum: number, item: InvoiceItem) => sum + item.price * item.quantity,
      0
    );

    const discVal =
      typeof discountValue === "string"
        ? parseFloat(discountValue)
        : discountValue;
    const taxVal =
      typeof taxValue === "string" ? parseFloat(taxValue) : taxValue;

    const discountAmount =
      discountValue !== "none" && !isNaN(discVal)
        ? subtotal * (discVal / 100)
        : 0;

    const taxableAmount = subtotal - discountAmount;

    const taxAmount =
      taxValue !== "none" && !isNaN(taxVal)
        ? taxableAmount * (taxVal / 100)
        : 0;

    const grandTotal = taxableAmount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };

  const totals = calculateTotals();

  const handleTaxChange = async (item: any) => {
    if (item.value === "custom") {
      Alert.alert(
        "Custom Tax",
        "Are you sure you want to enter a custom tax rate?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: () => {
              setShowCustomTax(true);
              setTaxValue(0);
            },
          },
        ]
      );
    } else {
      setShowCustomTax(false);
      setTaxValue(item.value);
    }
  };

  const handleDiscountChange = async (item: any) => {
    if (item.value === "custom") {
      Alert.alert(
        "Custom Discount",
        "Are you sure you want to enter a custom discount?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: () => {
              setShowCustomDiscount(true);
              setDiscountValue(0);
            },
          },
        ]
      );
    } else {
      setShowCustomDiscount(false);
      setDiscountValue(item.value);
    }
  };

  useEffect(() => {
    setSelectedCustomer(customer);
  }, [customer]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.uid) {
        return;
      }
      try {
        const response = await userDetailsService.getUserDetails(user.uid);
        if (response) {
          setFormData(response);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [user?.uid]);

  const handleChange = (key: keyof UserDetails, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTermChange = (text: string, index: number) => {
    const newTerms = [...formData.terms];
    newTerms[index] = text;
    handleChange("terms", newTerms);
  };

  const addTerm = () => {
    if (formData.terms.length < MAX_TERMS) {
      setFormData((prev) => ({ ...prev, terms: [...prev.terms, ""] }));
    }
  };

  const removeTerm = (index: number) => {
    const newTerms = formData.terms.filter((_, i) => i !== index);
    handleChange("terms", newTerms);
  };

  const handleContinue = () => {
    const errors = [];
    if (!currentInvoice?.items?.length) {
      errors.push("At least one product must be selected");
    }
    if (!selectedCustomer) {
      errors.push("A customer must be selected");
    }
    const requiredSenderFields: (keyof UserDetails)[] = [
      "fullName",
      "companyName",
      "dispatchAddress",
      "phoneNumber",
    ];
    requiredSenderFields.forEach((field) => {
      const value = formData[field];
      if (typeof value === "string" && !value.trim()) {
        errors.push(`Sender ${field} is required`);
      }
    });
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.push("Invalid phone number format (must be 10 digits)");
    }

    const taxNum =
      typeof taxValue === "string" ? parseFloat(taxValue) : taxValue;
    if (showCustomTax && (taxNum < 0 || taxNum > 100 || isNaN(taxNum))) {
      errors.push("Tax value must be between 0-100%");
    }

    const discNum =
      typeof discountValue === "string"
        ? parseFloat(discountValue)
        : discountValue;
    if (
      showCustomDiscount &&
      (discNum < 0 || discNum > 100 || isNaN(discNum))
    ) {
      errors.push("Discount value must be between 0-100%");
    }
    if (formData.terms.some((term) => term.trim() === "")) {
      errors.push("Terms and Conditions cannot be empty.");
    }
    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"), [
        { text: "OK", style: "cancel" },
      ]);
      return;
    }
    navigation.navigate("ConfirmationScreen", {
      formData,
      selectedCustomer: selectedCustomer!,
      currentInvoice,
      taxValue,
      discountValue,
      totals,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From</Text>

        <View>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => handleChange("fullName", text)}
          />

          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.companyName}
            onChangeText={(text) => handleChange("companyName", text)}
            multiline
          />

          <Text style={styles.label}>Dispatch Address</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={formData.dispatchAddress}
            onChangeText={(text) => handleChange("dispatchAddress", text)}
            multiline
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange("phoneNumber", text)}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill to</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            navigation.navigate("SelectCustomerModule");
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.azureblue}
          />
          <Text style={styles.selectButtonText}>Select Customer</Text>
        </TouchableOpacity>

        {selectedCustomer && (
          <View style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{selectedCustomer.name}</Text>
              <Text style={styles.customerCompany}>
                {selectedCustomer.companyName}
              </Text>
              <Text style={styles.customerContact}>
                {selectedCustomer.email} | {selectedCustomer.phone}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  dispatch(setCustomer(null));
                }}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products</Text>
        <View style={styles.productActionsContainer}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              navigation.navigate("SelectProductModule");
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.azureblue}
            />
            <Text style={styles.selectButtonText}>Select Products</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                dispatch(setCurrentInvoice(null));
              }}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        {currentInvoice && (
          <View style={styles.priceAdjustments}>
            <View style={styles.itemsContainer}>
              {currentInvoice.items.map((item: InvoiceItem) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} {item.unit} × ₹{item.price}/unit
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.adjustmentRow}>
              <Text style={styles.label}>Tax:</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: "No Tax", value: "none" },
                  { label: "5%", value: 5 },
                  { label: "12%", value: 12 },
                  { label: "18%", value: 18 },
                  { label: "Other", value: "custom" },
                ]}
                labelField="label"
                valueField="value"
                value={taxValue}
                onChange={handleTaxChange}
              />
              {showCustomTax && (
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  keyboardType="numeric"
                  value={taxValue.toString()}
                  onChangeText={(text) =>
                    setTaxValue(text.replace(/[^0-9]/g, ""))
                  }
                  placeholder="%"
                  maxLength={2}
                  placeholderTextColor={colors.gray}
                />
              )}
            </View>
            <View style={styles.adjustmentRow}>
              <Text style={styles.label}>Discount:</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: "No Discount", value: "none" },
                  { label: "5%", value: 5 },
                  { label: "10%", value: 10 },
                  { label: "15%", value: 15 },
                  { label: "Other", value: "custom" },
                ]}
                labelField="label"
                valueField="value"
                value={discountValue}
                onChange={handleDiscountChange}
              />
              {showCustomDiscount && (
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  keyboardType="numeric"
                  value={discountValue.toString()}
                  onChangeText={(text) =>
                    setDiscountValue(text.replace(/[^0-9]/g, ""))
                  }
                  placeholderTextColor={colors.gray}
                  placeholder="%"
                  maxLength={2}
                />
              )}
            </View>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{totals.subtotal}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={styles.totalValue}>-₹{totals.discountAmount}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({taxValue}%):</Text>
                <Text style={styles.totalValue}>+₹{totals.taxAmount}</Text>
              </View>

              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.totalLabel}>Grand Total:</Text>
                <Text style={styles.totalValue}>₹{totals.grandTotal}</Text>
              </View>
            </View>
            <Text style={styles.calculationNote}>
              * Tax is calculated on the amount after discount
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Terms and Conditions</Text>
        {formData.terms.map((term, index) => (
          <View key={index} style={styles.termContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput, styles.termInput]}
              value={term}
              onChangeText={(text) => handleTermChange(text, index)}
              placeholder={`Term ${index + 1}`}
              multiline
            />
            <TouchableOpacity
              onPress={() => removeTerm(index)}
              style={styles.iconButton}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {formData.terms.length < MAX_TERMS && (
          <TouchableOpacity style={styles.addButton} onPress={addTerm}>
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.addButtonText}>Add Term</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.notes}
          onChangeText={(text) => handleChange("notes", text)}
          multiline
        />
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutralBackground,
  },
  headerTitle: {
    color: colors.white,
    fontSize: size(22),
    fontFamily: fonts.poppinsBold,
    textAlign: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  adjustmentRow: {
    paddingTop: 20,
  },
  label: {
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 8,
    fontSize: size(14),
    marginBottom: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  termContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  termInput: {
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: size(14),
    fontFamily: fonts.poppinsBold,
  },
  section: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: size(18),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
    marginBottom: 16,
  },

  selectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white_smoke,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightgray,
  },
  selectButtonText: {
    color: colors.azureblue,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
    fontSize: size(18),
  },

  //customer styles
  customerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  customerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.text.Primary,
  },
  customerCompany: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
    marginTop: 4,
  },
  customerContact: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.bluishgray,
    marginTop: 4,
  },

  actionButton: {
    padding: 8,
  },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: colors.neutralText,
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightgray,
  },
  itemsContainer: {
    // maxHeight: 300,
    flex: 1,
    marginBottom: 16,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
  },
  itemDetails: {
    fontSize: size(14),
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: size(16),
    color: colors.text.Primary,
  },
  calculationNote: {
    fontSize: size(12),
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: "italic",
  },
  productActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceAdjustments: {
    // Add your styling here
  },
  dropdown: {
    marginTop: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallInput: {
    marginTop: 10,
    width: 80,
  },
  actions: {
    flexDirection: "row",
    marginLeft: 10,
  },
});

export default CreateInvoiceScreen;
