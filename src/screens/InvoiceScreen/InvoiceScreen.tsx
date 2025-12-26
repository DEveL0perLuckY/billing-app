import Ionicons from "@react-native-vector-icons/ionicons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type JSX,
} from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthProvider";
import { invoiceService } from "../../services/firestore";
import { InvoiceSummary } from "../../services/types";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { colors } from "../../theme/colors";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

type BillsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Bills"
>;

const InvoiceScreen = (): JSX.Element => {
  const navigation = useNavigation<BillsScreenNavigationProp>();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastVisibleRef =
    React.useRef<FirebaseFirestoreTypes.DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("CreateInvoice")}
          style={{ marginRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchInvoices = useCallback(
    async (reset = true) => {
      if (reset) {
        setRefreshing(true);
      }
      try {
        const {
          invoices: newInvoices,
          lastVisible: newLast,
          hasMore: moreAvailable,
        } = await invoiceService.getInvoices(
          user.uid,
          reset ? null : lastVisibleRef.current
        );

        setInvoices((prev) =>
          reset ? newInvoices : [...prev, ...newInvoices]
        );
        lastVisibleRef.current = newLast;
        setHasMore(moreAvailable);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (reset) {
          setRefreshing(false);
        }
      }
    },
    [user.uid]
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchInvoices(false);
    }
  };
  const handleRefresh = () => {
    fetchInvoices(true);
  };

  const toggleSelection = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // NEW: Handle Select All Logic
  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length && invoices.length > 0) {
      // Deselect all
      setSelectedInvoices([]);
      setIsSelecting(false);
    } else {
      // Select all
      const allIds = invoices.map((inv) => inv.id);
      setSelectedInvoices(allIds);
      setIsSelecting(true);
    }
  };

  const handleDeleteMultiple = async () => {
    Alert.alert(
      "Delete Invoices",
      `Are you sure you want to delete ${selectedInvoices.length} invoices?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await Promise.all(
                selectedInvoices.map((id) =>
                  invoiceService.deleteInvoice(user.uid, id)
                )
              );
              setInvoices((prev) =>
                prev.filter((invoice) => !selectedInvoices.includes(invoice.id))
              );
              setSelectedInvoices([]);
              setIsSelecting(false);
            } catch (error) {
              console.error("Error deleting invoices:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const navigateToDetail = (invoice: InvoiceSummary) => {
    navigation.navigate("InvoiceDetail", {
      invoiceId: invoice.id,
    });
  };

  const renderInvoiceItem: ListRenderItem<InvoiceSummary> = ({ item }) => {
    const isSelected = selectedInvoices.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.invoiceCard, isSelected && styles.selectedCard]}
        onPress={() => {
          if (isSelecting) {
            toggleSelection(item.id);
          } else {
            navigateToDetail(item);
          }
        }}
        onLongPress={() => {
          if (!isSelecting) {
            setIsSelecting(true);
            setSelectedInvoices([item.id]);
          }
        }}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>

          {isSelecting ? (
            <Ionicons
              name={isSelected ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={isSelected ? colors.primary : colors.lightgray}
            />
          ) : (
            <Ionicons
              name="document-text-outline"
              size={20}
              color={colors.primary}
            />
          )}
        </View>

        <View style={styles.clientInfo}>
          <Ionicons
            name="person-circle-outline"
            size={18}
            color={colors.textSecondary}
          />
          <Text style={styles.clientName} numberOfLines={1}>
            {item.selectedCustomer?.name || "No name"}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {dayjs
              .unix((item.createdAt as unknown as { seconds: number }).seconds)
              .format("MMM D, YYYY")}
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              ₹{parseFloat(item.totals.grandTotal.toString()).toFixed(2)}
            </Text>
            {!isSelecting && (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.bluishgray}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={styles.footerLoader}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Calculate if all items are currently selected for UI state
  const isAllSelected =
    invoices.length > 0 && selectedInvoices.length === invoices.length;

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.neutralBackground]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          {isSelecting ? (
            <View style={styles.selectionHeader}>
              <View style={styles.leftSelectionGroup}>
                <TouchableOpacity
                  onPress={() => {
                    setIsSelecting(false);
                    setSelectedInvoices([]);
                  }}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.text.Primary}
                  />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { marginLeft: 8 }]}>
                  {selectedInvoices.length} Selected
                </Text>
              </View>

              <View style={styles.rightSelectionGroup}>
                <TouchableOpacity
                  onPress={handleSelectAll}
                  style={styles.headerButton}
                >
                  <Ionicons
                    name={isAllSelected ? "checkbox" : "checkbox-outline"}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDeleteMultiple}
                  style={[styles.headerButton, { marginLeft: 12 }]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={colors.error || "#FF3B30"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Default Header State
            <View style={styles.defaultHeader}>
              <Text style={styles.subtitle}>{invoices.length} documents</Text>

              {/* Select All / Enter Selection Mode Button */}
              <TouchableOpacity
                onPress={handleSelectAll}
                style={styles.selectAllContainer}
              >
                <Ionicons
                  name="checkbox-outline"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {invoices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={colors.lightgray}
            />
            <Text style={styles.emptyText}>No invoices found</Text>
          </View>
        ) : (
          <FlashList
            data={invoices}
            renderItem={renderInvoiceItem}
            keyExtractor={(item) => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            ListFooterComponent={renderFooter}
            extraData={[selectedInvoices, isSelecting]}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 0,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  headerRow: {
    height: 40,
    marginBottom: 10,
    justifyContent: "center",
  },
  defaultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  selectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  leftSelectionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightSelectionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.text.Primary,
  },
  headerButton: {
    padding: 4,
  },
  subtitle: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.primary,
    marginRight: 6,
  },
  invoiceCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceNumber: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.text.Primary,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  clientName: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
    marginLeft: 8,
    maxWidth: "80%",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.bluishgray,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountText: {
    fontSize: size(16),
    color: colors.primary,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.lightgray,
    marginTop: 16,
  },
  footerLoader: {
    marginVertical: 20,
  },
});

export default InvoiceScreen;
