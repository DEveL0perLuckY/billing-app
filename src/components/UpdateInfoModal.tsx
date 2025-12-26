import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useForm, Controller } from "react-hook-form";
import Ionicons from "@react-native-vector-icons/ionicons";

import { fonts } from "../theme/fonts";
import { size } from "../theme/size";
import { colors } from "../theme/colors";

const UpdateInfoModal = ({
  visible,
  onClose,
  userDetails,
  onSave,
  disable,
}: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "80%"], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: userDetails?.fullName || "",
      phoneNumber: userDetails?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: colors.white }}
      handleIndicatorStyle={{ backgroundColor: colors.gray }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Update Information</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              rules={{ required: "Full Name is required" }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.fullName && styles.errorBorder,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.bluishgray}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
              name="fullName"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>
                {errors.fullName.message as string}
              </Text>
            )}
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              rules={{ required: "Phone Number is required" }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.phoneNumber && styles.errorBorder,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.bluishgray}
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
              name="phoneNumber"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>
                {errors.phoneNumber.message as string}
              </Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, disable && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={disable}
          >
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: size(20),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
  },
  closeIcon: {
    padding: 4,
    backgroundColor: colors.neutralBackground,
    borderRadius: 12,
  },
  formContainer: {
    paddingBottom: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: size(14),
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutralBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.text.Primary,
    height: "100%",
  },
  errorBorder: {
    borderColor: colors.error,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: colors.error,
    fontSize: size(12),
    marginTop: 6,
    fontFamily: fonts.poppinsRegular,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: colors.lightgray,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
  },
});

export default UpdateInfoModal;
