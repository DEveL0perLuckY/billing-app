import React, { useLayoutEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useCustomers } from "../../hooks/useCustomers";
import CustomerList from "../../components/CustomerList";

type CustomerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Tabs"
>; // Using 'Tabs' or generic definition since CustomerScreen is part of Tab Navigator but accesses Root stack for Form

interface Props {
  navigation: CustomerScreenNavigationProp;
}

const CustomerScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const { customers, loading } = useCustomers();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddCustomer}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddCustomer = () => {
    // @ts-ignore - navigating to a stack screen from tab
    navigation.navigate("CustomerForm", {});
  };

  const handleEditCustomer = (customer: Customer) => {
    // @ts-ignore - navigating to a stack screen from tab
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
      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
    margin: 16,
  },
  headerTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(22),
    color: colors.black,
  },
  addButton: {
    padding: 8,
  },
});

export default CustomerScreen;
