import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useAuth } from "../../context/AuthProvider";

import LogoutModal from "../../components/LogoutModal";
import UpdateCompanyInfoModal from "../../components/UpdateCompanyInfoModal";
import UpdateTermsModal from "../../components/UpdateTermsModal";
import UpdateNotesModal from "../../components/UpdateNotesModal";
import UpdateInfoModal from "../../components/UpdateInfoModal";
import { colors, colors as Colors } from "../../theme/colors";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { userDetailsService } from "../../services/firestore";
import { toast } from "../../theme/toast";
import { UserDetails } from "../../services/types";
import { useNavigation } from "@react-navigation/native";

interface InfoSectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  onEdit: () => void;
}

interface InfoRowProps {
  label: string;
  value: string | undefined | null;
  icon: any;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [modalVisible, setModalVisible] = useState(false); // Logout modal
  const [infoModalVisible, setInfoModalVisible] = useState(false); // Personal info modal
  const [companyInfoModalVisible, setCompanyInfoModalVisible] = useState(false); // Company Name/Address modal
  const [termsModalVisible, setTermsModalVisible] = useState(false); // Terms modal
  const [notesModalVisible, setNotesModalVisible] = useState(false); // Notes modal

  const [loading, setLoading] = useState(true);
  const [disable, setDisable] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.uid) {
        const details = await userDetailsService.initializeUserDetails(
          user.uid,
          user.displayName
        );
        setUserDetails(details);
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [user?.uid, user?.displayName]);

  const confirmLogout = () => {
    logout();
    setModalVisible(false);
    toast("info", "Logged Out", "You have successfully logged out.");
  };

  const handleUpdate = async (
    newDetails: Partial<UserDetails>,
    modalSetter: (val: boolean) => void
  ) => {
    setDisable(true);
    try {
      if (user?.uid) {
        await userDetailsService.updateUserDetails(user.uid, newDetails);
        setUserDetails((prev) => (prev ? { ...prev, ...newDetails } : null));
        modalSetter(false);
        toast("success", "Updated", "Details updated successfully.");
      }
    } catch (error) {
      toast("error", "Error", (error as Error).message || "An error occurred");
    } finally {
      setDisable(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <LogoutModal
          confirmLogout={confirmLogout}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />

        {/* Personal Info Modal */}
        <UpdateInfoModal
          visible={infoModalVisible}
          onClose={() => setInfoModalVisible(false)}
          userDetails={userDetails}
          onSave={(data: any) => handleUpdate(data, setInfoModalVisible)}
          disable={disable}
        />

        {/* Company Info Modal (Name & Address) */}
        <UpdateCompanyInfoModal
          visible={companyInfoModalVisible}
          onClose={() => setCompanyInfoModalVisible(false)}
          userDetails={userDetails}
          onSave={(data: any) => handleUpdate(data, setCompanyInfoModalVisible)}
          disable={disable}
        />

        {/* Terms Modal */}
        <UpdateTermsModal
          visible={termsModalVisible}
          onClose={() => setTermsModalVisible(false)}
          userDetails={userDetails}
          onSave={(data: any) => handleUpdate(data, setTermsModalVisible)}
          disable={disable}
        />

        {/* Notes Modal */}
        <UpdateNotesModal
          visible={notesModalVisible}
          onClose={() => setNotesModalVisible(false)}
          userDetails={userDetails}
          onSave={(data: any) => handleUpdate(data, setNotesModalVisible)}
          disable={disable}
        />

        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeLabel}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.displayName || "User"}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* SECTION 1: Personal Information */}
          <InfoSection
            title="Personal Information"
            icon="person-circle-outline"
            onEdit={() => setInfoModalVisible(true)}
          >
            <InfoRow
              label="Full Name"
              value={userDetails?.fullName}
              icon="person-outline"
            />
            <InfoRow
              label="Contact Number"
              value={userDetails?.phoneNumber}
              icon="call-outline"
            />
          </InfoSection>

          {/* SECTION 2: Company Details (Name & Address) */}
          <InfoSection
            title="Company Details"
            icon="business-outline"
            onEdit={() => setCompanyInfoModalVisible(true)}
          >
            <InfoRow
              label="Company Name"
              value={userDetails?.companyName}
              icon="briefcase-outline"
            />
            <InfoRow
              label="Dispatch Address"
              value={userDetails?.dispatchAddress}
              icon="location-outline"
            />
          </InfoSection>

          {/* SECTION 3: Terms & Conditions */}
          <InfoSection
            title="Terms & Conditions"
            icon="document-text-outline"
            onEdit={() => setTermsModalVisible(true)}
          >
            <View style={styles.infoRow}>
              <View style={styles.labelContainer}>
                <Ionicons
                  name="list-outline"
                  size={18}
                  color={Colors.secondary}
                  style={styles.rowIcon}
                />
                <Text style={styles.infoLabel}>Terms & Conditions</Text>
              </View>
              {Array.isArray(userDetails?.terms) &&
              userDetails?.terms.length! > 0 ? (
                <View style={styles.termsContainer}>
                  {userDetails?.terms.map((item, index) => (
                    <View key={index} style={styles.termItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.termText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>Not set</Text>
              )}
            </View>
          </InfoSection>

          {/* SECTION 4: Notes */}
          <InfoSection
            title="Notes"
            icon="clipboard-outline"
            onEdit={() => setNotesModalVisible(true)}
          >
            <InfoRow
              label="Invoice Notes"
              value={userDetails?.notes}
              icon="clipboard-outline"
            />
          </InfoSection>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoSection = ({ title, icon, children, onEdit }: InfoSectionProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.titleContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>{children}</View>
  </View>
);

const InfoRow = ({ label, value, icon }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={styles.labelContainer}>
      <Ionicons
        name={icon}
        size={18}
        color={Colors.secondary}
        style={styles.rowIcon}
      />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || "Not set"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutralBackground,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutralBackground,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeLabel: {
    color: colors.overlay.white95,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
    marginBottom: 4,
  },
  userName: {
    color: colors.overlay.white95,
    fontSize: size(24),
    fontFamily: fonts.poppinsBold,
    marginBottom: 4,
  },
  userEmail: {
    color: colors.overlay.white95,
    fontSize: size(14),
    fontFamily: fonts.poppinsRegular,
  },
  contentContainer: {
    padding: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutralBackground,
    paddingBottom: 15,
  },
  cardContent: {},
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(18),
    color: Colors.neutralText,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.neutralBackground,
    borderRadius: 10,
  },
  infoRow: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  rowIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(12),
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: size(18),
  },
  infoValue: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: Colors.neutralText,
    paddingLeft: 26,
  },
  termsContainer: {
    marginTop: 8,
    paddingLeft: 26,
  },
  termItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 8,
    marginRight: 10,
  },
  termText: {
    flex: 1,
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: Colors.neutralText,
    lineHeight: 22,
  },
});

export default HomeScreen;
