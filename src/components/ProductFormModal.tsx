import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "@react-native-vector-icons/ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { size } from "../theme/size";
import { toast } from "../theme/toast";

const UNIT_OPTIONS = [
  { label: "Meter (m)", value: "m" },
  { label: "Kilometer (km)", value: "km" },
  { label: "Feet (ft)", value: "ft" },
  { label: "Inch (in)", value: "in" },
  { label: "Centimeter (cm)", value: "cm" },
  { label: "Roll", value: "roll" },
  { label: "Coil", value: "coil" },
  { label: "Spool", value: "spool" },
  { label: "Piece (pc)", value: "pc" },
  { label: "Set", value: "set" },
];

export interface ProductFormData {
  id?: string | null;
  name: string;
  price: string;
  unit: string;
  quantity: string;
  barcodeId?: string;
}

interface ProductFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData: ProductFormData | null;
  loading: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const isProcessingScan = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      price: "",
      unit: "pc",
      quantity: "",
      barcodeId: "",
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        name: initialData?.name || "",
        price: initialData?.price || "",
        unit: initialData?.unit || "pc",
        quantity: initialData?.quantity || "",
        barcodeId: initialData?.barcodeId || "",
      });
    }
  }, [visible, initialData, reset]);

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

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    setScanning(false);
    setValue("barcodeId", data);
    toast("success", "Scanned", "Barcode scanned successfully");

    setTimeout(() => {
      isProcessingScan.current = false;
    }, 1000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {initialData?.id ? "Edit Product" : "New Product"}
          </Text>

          <Controller
            control={control}
            name="name"
            rules={{ required: "Product name is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  placeholder="Product Name"
                  placeholderTextColor={colors.bluishgray}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                />
                {errors.name && (
                  <Text style={styles.errorText}>
                    {errors.name.message as string}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="price"
            rules={{
              required: "Price is required",
              validate: (value) =>
                (!isNaN(parseFloat(value)) && parseFloat(value) > 0) ||
                "Price must be a valid number > 0",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  placeholder="Price"
                  placeholderTextColor={colors.bluishgray}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  keyboardType="numeric"
                />
                {errors.price && (
                  <Text style={styles.errorText}>
                    {errors.price.message as string}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="quantity"
            rules={{
              required: "Quantity is required",
              validate: (value) =>
                (!isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 0) ||
                "Quantity must be a valid number >= 0",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  placeholder="Quantity"
                  placeholderTextColor={colors.bluishgray}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  keyboardType="numeric"
                />
                {errors.quantity && (
                  <Text style={styles.errorText}>
                    {errors.quantity.message as string}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="barcodeId"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.barcodeContainer}>
                <TextInput
                  placeholder="Barcode ID"
                  placeholderTextColor={colors.bluishgray}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={[styles.input, styles.barcodeInput]}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={startScanning}
                >
                  <Ionicons name="scan" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          />

          <Controller
            control={control}
            name="unit"
            rules={{ required: "Unit is required" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.dropdownContainer}>
                <Dropdown
                  data={UNIT_OPTIONS}
                  labelField="label"
                  valueField="value"
                  value={value}
                  onChange={(item) => onChange(item.value)}
                  placeholder="Select Unit"
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainerStyle}
                />
                {errors.unit && (
                  <Text style={styles.errorText}>
                    {errors.unit.message as string}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {initialData?.id ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.text.Primary,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.neutralBackground,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.text.Primary,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    height: 50,
    borderColor: colors.gray,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  dropdownContainerStyle: {
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.gray,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.white,
  },
  disabledButton: {
    backgroundColor: colors.bluishgray,
  },
  errorText: {
    color: colors.error,
    fontSize: size(12),
    marginLeft: 16,
    marginTop: 4,
  },
  barcodeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  barcodeInput: {
    flex: 1,
    marginBottom: 0,
  },
  scanButton: {
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
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

export default ProductFormModal;
