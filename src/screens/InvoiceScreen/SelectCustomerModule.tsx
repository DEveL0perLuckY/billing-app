import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthProvider";

import Ionicons from "@react-native-vector-icons/ionicons";

import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/MySlice";
import { customerService } from "../../services/firestore";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { Customer } from "../../services/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useCustomers } from "../../hooks/useCustomers";
import CustomerList from "../../components/CustomerList";

type SelectCustomerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SelectCustomerModule"
>;

const SelectCustomerModule = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<SelectCustomerScreenNavigationProp>();
  const { user } = useAuth();
  const { customers, loading } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddCustomer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!loading && customers.length > 0 && !selectedCustomer) {
      if (customers.length > 1) {
        setSelectedCustomer(customers[1]);
      } else if (customers.length === 1) {
        setSelectedCustomer(customers[0]);
      }
    }
  }, [loading, customers]);

  const handleAddCustomer = () => {
    navigation.navigate("CustomerForm", {});
  };

  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate("CustomerForm", { customer });
  };

  const confirmDelete = (customerId: string) => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDelete(customerId) },
      ]
    );
  };

  const handleDelete = async (customerId: string) => {
    try {
      await customerService.deleteCustomer(user.uid, customerId);
      toast("success", "Deleted", "Customer removed successfully");
    } catch (error) {
      toast("error", "Error", "Something went wrong");
    }
  };
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer.id === selectedCustomer?.id ? null : customer);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primaryLight, colors.neutralBackground]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.neutralBackground]}
      style={styles.container}
    >
      <CustomerList
        customers={customers}
        loading={loading}
        onEdit={handleEditCustomer}
        onDelete={confirmDelete}
        onSelect={handleSelectCustomer}
        selectedId={selectedCustomer?.id}
      />

      {/* Always show continue button, disable when no customer selected */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedCustomer && styles.disabledContinueButton,
        ]}
        onPress={() => {
          dispatch(setCustomer(selectedCustomer));
          navigation.goBack();
        }}
        disabled={!selectedCustomer}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    margin: 16,
  },
  continueButtonText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
    fontSize: size(18),
  },
  disabledContinueButton: {
    backgroundColor: colors.bluishgray,
    opacity: 0.6,
  },
});
export default SelectCustomerModule;
