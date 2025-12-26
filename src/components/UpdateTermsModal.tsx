import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
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

const UpdateTermsModal = ({
  visible,
  onClose,
  userDetails,
  onSave,
  disable,
}: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "80%"], []);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      terms: userDetails?.terms || [],
    },
  });

  const [termsError, setTermsError] = useState<string | null>(null);
  const terms = watch("terms");

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
    if (terms.some((term: string) => term.trim() === "")) {
      setTermsError("Terms cannot be empty.");
      return;
    } else {
      setTermsError(null);
    }
    onSave(data);
    toast("success", "Success!", "Terms updated.");
  };

  const addTerm = () => {
    if (terms.length < 5) {
      setValue("terms", [...terms, ""]);
    }
  };

  const removeTerm = (index: number) => {
    const updatedTerms = terms.filter((_: string, i: number) => i !== index);
    setValue("terms", updatedTerms);
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Conditions ({terms.length}/5)
            </Text>
            {terms.length < 5 && (
              <TouchableOpacity onPress={addTerm} style={styles.addMiniButton}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addMiniText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {terms.map((item: string, index: number) => (
            <View key={index} style={styles.termCard}>
              <View style={styles.termIndex}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <BottomSheetTextInput
                    style={styles.termInput}
                    placeholder={`Condition ${index + 1}`}
                    value={value}
                    placeholderTextColor={colors.gray}
                    onChangeText={onChange}
                    multiline
                  />
                )}
                name={`terms.${index}` as any}
              />
              <TouchableOpacity
                onPress={() => removeTerm(index)}
                style={styles.deleteAction}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {termsError && <Text style={styles.errorText}>{termsError}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, disable && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={disable}
          >
            <Text style={styles.saveButtonText}>Save Terms</Text>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: size(16),
    fontFamily: fonts.poppinsBold,
    color: colors.textSecondary,
  },
  addMiniButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addMiniText: {
    fontSize: size(12),
    fontFamily: fonts.poppinsBold,
    color: colors.primary,
    marginLeft: 4,
  },
  termCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termIndex: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.neutralBackground,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  indexText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(14),
    color: colors.textSecondary,
  },
  termInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    color: colors.text.Primary,
    minHeight: 50,
  },
  deleteAction: {
    padding: 12,
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

export default UpdateTermsModal;
