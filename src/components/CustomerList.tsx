import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Customer } from "../services/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { size } from "../theme/size";

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onSelect?: (customer: Customer) => void;
  selectedId?: string | null;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  onEdit,
  onDelete,
  onSelect,
  selectedId,
}) => {
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
    <FlashList
      data={customers}
      contentContainerStyle={styles.listContent}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.customerCard,
            selectedId === item.id && styles.selectedCustomer,
          ]}
          onPress={() => onSelect && onSelect(item)}
          disabled={!onSelect}
          activeOpacity={onSelect ? 0.7 : 1}
        >
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerCompany}>{item.companyName}</Text>
            <Text style={styles.customerContact}>
              {item.email} | {item.phone}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create" size={20} color={colors.azureblue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(item.id!)}
            >
              <Ionicons name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.bluishgray} />
          <Text style={styles.emptyText}>No customers found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
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
  selectedCustomer: {
    borderColor: colors.primary,
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
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    padding: 16,
  },
  emptyText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.textSecondary,
    marginTop: 16,
  },
});

export default CustomerList;
