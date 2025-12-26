import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Product } from "../services/types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { size } from "../theme/size";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  renderRightActions?: (item: Product) => React.ReactNode;
  onSelect?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  refreshing,
  onRefresh,
  onEdit,
  onDelete,
  renderRightActions,
  onSelect,
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
      data={products}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          <View style={styles.cardLeftAccent} />
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={styles.productInfoContainer}
              onPress={() => onSelect && onSelect(item)}
              disabled={!onSelect}
              activeOpacity={onSelect ? 0.7 : 1}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.productPrice}>
                    ₹{item.price.toFixed(2)}
                    <Text style={styles.unitText}> / {item.unit}</Text>
                  </Text>
                  {item.quantity !== undefined && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>Qty: {item.quantity}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.actionsContainer}>
              {renderRightActions ? (
                renderRightActions(item)
              ) : (
                <View style={styles.defaultActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEdit(item)}
                  >
                    <Ionicons
                      name="pencil"
                      size={18}
                      color={colors.azureblue}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(item.id!)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>Add a new product to get started</Text>
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
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  cardLeftAccent: {
    width: 6,
    backgroundColor: colors.primary,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.text.Primary,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  productPrice: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(14),
    color: colors.text.Primary,
  },
  unitText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.textSecondary,
  },
  badgeContainer: {
    backgroundColor: colors.neutralBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "rgba(0, 122, 255, 0.1)", // Light azureblue
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)", // Light error
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.text.Primary,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default ProductList;
