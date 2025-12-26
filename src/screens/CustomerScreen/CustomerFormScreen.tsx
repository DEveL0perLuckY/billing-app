import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthProvider";

import Ionicons from "@react-native-vector-icons/ionicons";

import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { customerService } from "../../services/firestore";
import { Customer } from "../../services/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CustomerForm">;

const CustomerFormScreen = ({ route, navigation }: Props) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    companyName: "",
    billingAddress: "",
    shippingAddress: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.customer) {
      setFormData(route.params.customer);
      navigation.setOptions({ title: "Edit Customer" });
    }
  }, [route.params, navigation]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast("error", "Validation Error", "Please fill required fields");
      return;
    }
    setLoading(true);
    try {
      const customerData = { ...formData };
      // Remove id from data to be saved/updated in the fields
      delete customerData.id;

      if (formData.id) {
        await customerService.updateCustomer(
          user.uid,
          formData.id,
          customerData
        );
        toast("success", "Updated", "Customer updated successfully");
      } else {
        await customerService.createCustomer(user.uid, customerData);
        toast("success", "Created", "Customer added successfully");
      }

      navigation.goBack();
    } catch (error) {
      toast("error", "Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.neutralBackground]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContent}>
          <TextInput
            placeholder="Full Name *"
            placeholderTextColor={colors.bluishgray}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
          />

          <TextInput
            placeholder="Email *"
            placeholderTextColor={colors.bluishgray}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Phone *"
            placeholderTextColor={colors.bluishgray}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <TextInput
            placeholder="Company Name"
            placeholderTextColor={colors.bluishgray}
            value={formData.companyName}
            onChangeText={(text) =>
              setFormData({ ...formData, companyName: text })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="GST Number"
            placeholderTextColor={colors.bluishgray}
            value={formData.gstNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, gstNumber: text })
            }
            style={styles.input}
            maxLength={15}
          />

          <TextInput
            placeholder="Billing Address"
            placeholderTextColor={colors.bluishgray}
            value={formData.billingAddress}
            onChangeText={(text) =>
              setFormData({ ...formData, billingAddress: text })
            }
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
          />

          <TextInput
            placeholder="Shipping Address"
            placeholderTextColor={colors.bluishgray}
            value={formData.shippingAddress}
            onChangeText={(text) =>
              setFormData({ ...formData, shippingAddress: text })
            }
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {formData.id ? "Update Customer" : "Create Customer"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.text.Primary,
  },
  placeholderView: {
    width: 24,
  },
  formContent: {
    padding: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.text.Primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  footer: {
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.bluishgray,
  },
});

export default CustomerFormScreen;
