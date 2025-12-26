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

const UpdateNotesModal = ({
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
      notes: userDetails?.notes || "",
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
    toast("success", "Success!", "Notes updated.");
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: colors.neutralBackground }}
      handleIndicatorStyle={{ backgroundColor: colors.gray }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invoice Notes</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesContainer}>
            <Controller
              control={control}
              rules={{ required: "Notes cannot be empty" }}
              render={({ field: { onChange, value } }) => (
                <BottomSheetTextInput
                  style={styles.notesInput}
                  placeholder="Add a footer note for your invoices..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={value}
                  onChangeText={onChange}
                />
              )}
              name="notes"
            />
          </View>
          {errors.notes && (
            <Text style={styles.errorText}>
              {errors.notes.message as string}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.saveButton, disable && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={disable}
          >
            <Text style={styles.saveButtonText}>Save Notes</Text>
          </TouchableOpacity>

          {/* Extra spacing for keyboard */}
          <View style={{ height: 20 }} />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: size(22),
    fontFamily: fonts.poppinsBold,
    color: colors.text.Primary,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  notesContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  notesInput: {
    minHeight: 150,
    padding: 12,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.text.Primary,
    textAlignVertical: "top",
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
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.lightgray,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
  },
});

export default UpdateNotesModal;
