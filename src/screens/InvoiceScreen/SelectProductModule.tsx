import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthProvider";

import Ionicons from "@react-native-vector-icons/ionicons";

import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentInvoice } from "../../redux/MySlice";
import { productService } from "../../services/firestore";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { Product } from "../../services/types";
import { useProducts } from "../../hooks/useProducts";
import ProductList from "../../components/ProductList";
import ProductFormModal, {
  ProductFormData,
} from "../../components/ProductFormModal";

const SelectProductModule = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const dispatch = useDispatch();
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

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const isProcessingScan = useRef(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const currentInvoice = useSelector(
    (state: any) => state.MySlice.currentInvoice
  );

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission needed",
          "Camera permission is required to scan barcodes. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    isProcessingScan.current = false;
    setScanning(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <TouchableOpacity onPress={startScanning}>
            <Ionicons name="scan" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setModalInitialData(null);
              setIsModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, startScanning]);

  useEffect(() => {
    if (currentInvoice) {
      const initialQuantities: { [key: string]: number } = {};
      currentInvoice.items.forEach((item: any) => {
        const productExists = products.some((p) => p.id === item.id);
        if (productExists) {
          initialQuantities[item.id] = item.quantity;
        }
      });
      setQuantities(initialQuantities);
    }
  }, [currentInvoice, products]);

  const handleQuantityChange = (productId: string, text: string) => {
    const value = parseInt(text, 10) || 0;
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleIncrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0),
    }));
  };

  const handleContinue = () => {
    const invoiceData = {
      items: selectedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: quantities[product.id!],
      })),
      total: totalAmount,
    };
    dispatch(setCurrentInvoice(invoiceData));
    navigation.goBack();
  };

  useEffect(() => {
    const newTotal = products.reduce((sum, product) => {
      return sum + product.price * (quantities[product.id!] || 0);
    }, 0);
    setTotalAmount(newTotal);
    const selected = products.filter((p) => (quantities[p.id!] || 0) > 0);
    setSelectedProducts(selected);
  }, [quantities, products]);

  // --- CAMERA LOGIC ---
  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Prevent duplicate processing
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    setScanning(false); // Close modal

    // Logic to match scanned data to product barcodeId
    const product = products.find((p) => p.barcodeId === data);

    if (product) {
      handleIncrement(product.id!);
      toast("success", "Added", `Added ${product.name} to cart`);
    } else {
      // Optional: You can handle unknown barcodes here
      toast("error", "Not Found", "Product not found");
      console.log(`Scanned Code: ${data} (Type: ${type})`);
    }

    // Reset lock after a delay to allow future scans
    setTimeout(() => {
      isProcessingScan.current = false;
    }, 1000);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        unit: data.unit,
        quantity: 0, // Initialize quantity
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
        renderRightActions={(item) => (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleDecrement(item.id!)}
              style={styles.quantityButton}
            >
              <Ionicons
                name="remove-circle"
                size={32}
                color={colors.azureblue}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantities[item.id!]?.toString() || "0"}
              onChangeText={(text) => handleQuantityChange(item.id!, text)}
            />

            <TouchableOpacity
              onPress={() => handleIncrement(item.id!)}
              style={styles.quantityButton}
            >
              <Ionicons name="add-circle" size={32} color={colors.azureblue} />
            </TouchableOpacity>
          </View>
        )}
      />

      <ProductFormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={modalInitialData}
        loading={formLoading}
      />

      {/* Always show bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.itemsText}>
              Items: {selectedProducts.length}
            </Text>
            <Text style={styles.amountText}>
              Amount: ₹ {totalAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedProducts.length === 0 && styles.disabledContinueButton,
            ]}
            onPress={handleContinue}
            disabled={selectedProducts.length === 0}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expo Camera Modal */}
      {scanning && (
        <Modal
          visible={scanning}
          animationType="slide"
          onRequestClose={() => setScanning(false)}
        >
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                ],
              }}
            />

            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraOverlayText}>Scan a barcode</Text>
              <View style={styles.scanFrame} />
            </View>

            <TouchableOpacity
              style={styles.closeCameraButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.closeCameraText}>Close Camera</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  actions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  quantityButton: {
    padding: 10,
  },
  quantityInput: {
    fontSize: 20,
    fontFamily: fonts.poppinsBold,
    color: colors.black,
    textAlign: "center",
    minWidth: 40,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutralText,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    marginRight: 8,
  },
  disabledContinueButton: {
    backgroundColor: colors.bluishgray,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOverlayText: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "600",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  closeCameraButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  closeCameraText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SelectProductModule;
