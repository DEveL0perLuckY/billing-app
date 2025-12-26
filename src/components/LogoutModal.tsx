import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Ionicons from "@react-native-vector-icons/ionicons";

import { fonts } from "../theme/fonts";
import { colors } from "../theme/colors";
import { size } from "../theme/size";
const { width } = Dimensions.get("window");

const LogoutModal = ({ confirmLogout, setModalVisible, modalVisible }: any) => {
  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Ionicons
            name="log-out-outline"
            size={40}
            color={colors.primary}
            style={styles.modalIcon}
          />
          <Text style={styles.modalTitle}>Confirm Logout</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to sign out of your account?
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmLogout}
            >
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: size(22),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: size(16),
    color: colors.textSecondary,
    fontFamily: fonts.poppinsRegular,
    textAlign: "center",
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.black,
  },

  confirmButtonText: {
    color: colors.white,
  },
  cancelButton: {
    backgroundColor: colors.neutralBackground,
  },
  confirmButton: {
    backgroundColor: colors.error,
  },
});
