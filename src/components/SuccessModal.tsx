import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { size } from "../theme/size";

const { width } = Dimensions.get("window");

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onShare?: () => void; // Added onShare prop
  message: string;
  path?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  onShare,
  message,
  path,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={colors.success}
            />
          </View>
          <Text style={styles.modalTitle}>Success!</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          {path && (
            <View style={styles.pathContainer}>
              <Text style={styles.pathLabel}>Saved to:</Text>
              <Text
                style={styles.pathText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {path.split("/").pop()}
              </Text>
              <Text style={styles.pathSubText}>(In Downloads)</Text>
            </View>
          )}

          {/* New Share Button */}
          {path && onShare && (
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={onShare}
            >
              <Ionicons
                name="share-social"
                size={20}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Share File</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.okButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.okButtonText]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: size(24),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: size(16),
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  pathContainer: {
    backgroundColor: colors.neutralBackground,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },
  pathLabel: {
    fontSize: size(12),
    fontFamily: fonts.poppinsBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pathText: {
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.text.Primary,
    textAlign: "center",
  },
  pathSubText: {
    fontSize: size(10),
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  shareButton: {
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  okButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
  },
  okButtonText: {
    color: colors.textSecondary,
  },
});

export default SuccessModal;
