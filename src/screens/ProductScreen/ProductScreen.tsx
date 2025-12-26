import React, { useState, useLayoutEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthProvider";
import Ionicons from "@react-native-vector-icons/ionicons";

import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { productService } from "../../services/firestore";
import { Product } from "../../services/types";
import { useProducts } from "../../hooks/useProducts";
import ProductList from "../../components/ProductList";
import ProductFormModal, {
  ProductFormData,
} from "../../components/ProductFormModal";

const ProductScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const {
    products,
    loading,
    refreshing,
    loadProducts,
    handleRefresh,
    handleDelete,
  } = useProducts();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalInitialData, setModalInitialData] =
    useState<ProductFormData | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("InventoryStats")}
            style={{ marginRight: 16 }}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons name="stats-chart" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalInitialData(null);
              setIsModalVisible(true);
            }}
            style={{ marginRight: 16 }}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const handleFormSubmit = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        unit: data.unit,
        quantity: parseInt(data.quantity, 10) || 0,
        barcodeId: data.barcodeId?.trim() || undefined,
      };

      if (modalInitialData?.id) {
        await productService.updateProduct(
          user.uid,
          modalInitialData.id,
          productData
        );
        toast("success", "Updated", "Product updated successfully");
      } else {
        await productService.createProduct(user.uid, productData);
        toast("success", "Created", "Product added successfully");
      }

      setIsModalVisible(false);
      loadProducts();
    } catch (error) {
      console.error(error);
      toast("error", "Error", "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setModalInitialData({
      id: product.id!,
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      quantity: product.quantity ? product.quantity.toString() : "",
      barcodeId: product.barcodeId || "",
    });
    setIsModalVisible(true);
  };

  const confirmDelete = (productId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDelete(productId) },
      ]
    );
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
      <ProductList
        products={products}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEdit={handleEditProduct}
        onDelete={confirmDelete}
      />

      <ProductFormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={modalInitialData}
        loading={formLoading}
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
});

export default ProductScreen;
