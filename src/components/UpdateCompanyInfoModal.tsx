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
import { toast } from "../theme/toast";
import { colors } from "../theme/colors";

const UpdateCompanyInfoModal = ({
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
      companyName: userDetails?.companyName || "",
      dispatchAddress: userDetails?.dispatchAddress || "",
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
    toast("success", "Success!", "Company info updated successfully.");
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Company Info</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <Controller
              control={control}
              rules={{ required: "Company name is required" }}
              render={({ field: { onChange, value } }) => (
                <BottomSheetTextInput
                  style={[
                    styles.input,
                    errors.companyName && styles.errorInput,
                  ]}
                  placeholder="e.g. Acme Corp"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
              name="companyName"
            />
            {errors.companyName && (
              <Text style={styles.errorText}>
                {errors.companyName.message as string}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dispatch Address</Text>
            <Controller
              control={control}
              rules={{ required: "Dispatch address is required" }}
              render={({ field: { onChange, value } }) => (
                <BottomSheetTextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.dispatchAddress && styles.errorInput,
                  ]}
                  placeholder="Enter full address"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                />
              )}
              name="dispatchAddress"
            />
            {errors.dispatchAddress && (
              <Text style={styles.errorText}>
                {errors.dispatchAddress.message as string}
              </Text>
            )}
          </View>

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
  closeIcon: {
    padding: 4,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: size(20),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
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
  input: {
    width: "100%",
    backgroundColor: colors.neutralBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.text.Primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: colors.error,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: colors.error,
    fontSize: size(12),
    marginTop: 4,
    fontFamily: fonts.poppinsRegular,
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
  },
  buttonText: {
    color: colors.white,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
  },
});

export default UpdateCompanyInfoModal;
