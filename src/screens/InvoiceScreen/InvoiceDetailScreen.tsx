import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import Ionicons from "@react-native-vector-icons/ionicons";
import ReactNativeBlobUtil from "react-native-blob-util";
import { useAuth } from "../../context/AuthProvider";
import dayjs from "dayjs";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { invoiceService } from "../../services/firestore";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { toast } from "../../theme/toast";
import { colors } from "../../theme/colors";
import { Invoice } from "../../services/types";
import { LinearGradient } from "expo-linear-gradient";
import SuccessModal from "../../components/SuccessModal";

const InvoiceDetailScreen = ({ route, navigation }: any) => {
  const {
    invoiceId: paramInvoiceId,
    id,
    fromConfirmation,
    invoice: paramInvoice,
  } = route.params as {
    invoiceId?: string;
    id?: string;
    fromConfirmation: boolean;
    invoice?: Invoice;
  };
  const invoiceId = paramInvoiceId || id || "";

  useEffect(() => {
    const backAction = () => {
      if (fromConfirmation) {
        navigation.navigate("Tabs");
      } else {
        navigation.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation, fromConfirmation]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [download, setDownloading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [savedFilePath, setSavedFilePath] = useState("");

  const fetchInvoice = async () => {
    if (paramInvoice) {
      setInvoice(paramInvoice);
      setLoading(false);
      return;
    }

    try {
      const resp = await invoiceService.getInvoice(user.uid, invoiceId);
      setInvoice(resp);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramInvoice]);

  // --- NEW FUNCTION TO HANDLE SHARING FROM MODAL ---
  const handleShareSavedFile = async () => {
    try {
      if (!savedFilePath) return;

      if (!(await Sharing.isAvailableAsync())) {
        toast("error", "Error", "Sharing is not available on this device");
        return;
      }

      // Android often requires the 'file://' prefix for local files
      const sharePath =
        Platform.OS === "android" && !savedFilePath.startsWith("file://")
          ? `file://${savedFilePath}`
          : savedFilePath;

      await Sharing.shareAsync(sharePath, {
        mimeType: "application/pdf",
        dialogTitle: "Share Invoice",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error sharing saved file:", error);
      toast("error", "Share Failed", "Could not share the downloaded file.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Invoice not found</Text>
      </View>
    );
  }
  const generatePDF = async (invData: Invoice, isDownload: boolean = false) => {
    setDownloading(true);
    try {
      const htmlContent = `
      <html>
      <head>
      <style>
        @page {size: A4;margin: 10mm;background: ${colors.neutralBackground};}
        body { margin: 0; padding: 10px; background: ${
          colors.neutralBackground
        }; color: ${colors.text.Primary}; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 700; color: ${
          colors.text.Primary
        }; }
        .date-badge { background: ${
          colors.border
        }; padding: 6px 12px; border-radius: 6px; font-size: 14px; }
        .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .info-columns { display: flex; gap: 30px; margin-bottom: 20px; }
        .column { flex: 1; }
        .section-title { color: ${
          colors.primary
        }; font-size: 16px; font-weight: 700; margin-bottom: 12px; }
        .text { font-size: 14px; color: ${
          colors.textSecondary
        }; margin-bottom: 6px; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: ${
          colors.neutralBackground
        }; padding: 12px; text-align: left; font-size: 14px; color: ${
        colors.neutralText
      }; border-bottom: 2px solid ${colors.border}; }
        td { padding: 12px; border-bottom: 1px solid ${
          colors.border
        }; font-size: 14px; color: ${colors.text.Primary}; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid ${
          colors.border
        }; }
        .total-label { font-weight: 600; color: ${colors.text.Primary}; }
        .total-amount { color: ${colors.primary}; font-weight: 600; }
        .grand-total { font-size: 18px; color: ${colors.primary} !important; }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Invoice #${invData.invoiceNumber}</h1>
            <div class="date-badge">
              ${
                invData.createdAt
                  ? dayjs
                      .unix((invData.createdAt as any).seconds)
                      .format("MMM D, YYYY")
                  : ""
              }
            </div>
          </div>

          <div class="section">
            <div class="info-columns">
              <div class="column">
                <div class="section-title">From:</div>
                <div class="text">${invData.formData.companyName}</div>
                <div class="text">${invData.formData.dispatchAddress}</div>
                <div class="text">${invData.formData.phoneNumber}</div>
              </div>
              <div class="column">
                <div class="section-title">Bill To:</div>
                <div class="text">${invData.selectedCustomer.name}</div>
                <div class="text">${invData.selectedCustomer.companyName}</div>
                <div class="text">${invData.selectedCustomer.email}</div>
                <div class="text">${invData.selectedCustomer.phone}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Items</div>
            <table>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
              ${invData.currentInvoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>₹${item.price}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </div>

          <div class="section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">₹${invData.totals.subtotal}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax (${invData.taxValue}%):</span>
              <span class="total-amount">₹${invData.totals.taxAmount}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Discount (${
                invData.discountValue
              }%):</span>
              <span class="total-amount">₹${
                invData.totals.discountAmount
              }</span>
            </div>
            <div class="total-row" style="border-top: 2px solid ${
              colors.primary
            };">
              <span class="total-label grand-total">Grand Total:</span>
              <span class="total-amount grand-total">₹${
                invData.totals.grandTotal
              }</span>
            </div>
          </div>

          <div class="section">
          <div class="section-title" style="margin-top: 20px;">Terms</div>
            <ul>
            ${invData.formData.terms
              .map(
                (term) => `
              <li class="text">${term}</li>
            `
              )
              .join("")}
            </ul>
            <div class="section-title">Notes</div>
            <div class="text">${invData.formData.notes}</div>
          </div>
        </div>
      </body>
      </html>
      `;
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      if (isDownload) {
        const fileName = `Invoice_${invData.invoiceNumber}.pdf`;
        const dirs = ReactNativeBlobUtil.fs.dirs;
        const targetPath =
          Platform.OS === "ios"
            ? `${dirs.DocumentDir}/${fileName}`
            : `${dirs.DownloadDir}/${fileName}`;

        await ReactNativeBlobUtil.fs.cp(uri, targetPath);

        if (Platform.OS === "android") {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: fileName,
              parentFolder: "",
              mimeType: "application/pdf",
            },
            "Download",
            targetPath
          );
        }

        setSavedFilePath(targetPath);
        setSuccessModalVisible(true);
      } else {
        if (!(await Sharing.isAvailableAsync())) {
          toast(
            "error",
            "Sharing Not Supported",
            "This device does not support sharing."
          );
          return;
        }

        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Invoice",
          UTI: "com.adobe.pdf",
        });

        toast(
          "success",
          "Invoice Generated",
          "Invoice PDF has been shared successfully."
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast(
        "error",
        "PDF Generation Failed",
        "An error occurred while generating the invoice."
      );
    } finally {
      setDownloading(false);
    }
  };
  const renderItem: ListRenderItem<any> = ({ item, index }) => (
    <View
      style={[styles.itemContainer, index % 2 === 1 && styles.itemContainerAlt]}
    >
      <View style={styles.itemRow}>
        <View style={styles.colItem}>
          <Text style={styles.itemTextName}>{item.name}</Text>
        </View>
        <View style={styles.colQty}>
          <Text style={styles.itemText}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        <View style={styles.colPrice}>
          <Text style={styles.itemText}>₹{item.price}</Text>
        </View>
        <View style={styles.colTotal}>
          <Text style={[styles.itemText, styles.textBold]}>
            ₹{(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Invoice #{invoice.invoiceNumber}</Text>
        <View style={[styles.statusContainer, styles.statusBadge]}>
          <Text style={styles.statusText}>
            {invoice.createdAt
              ? dayjs
                  .unix((invoice.createdAt as any).seconds)
                  .format("MMM D, YYYY")
              : ""}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.columnWrapper}>
            <Text style={styles.sectionTitle}>From:</Text>
            <Text style={styles.text} numberOfLines={2}>
              {invoice.formData.companyName}
            </Text>
            <Text style={styles.text} numberOfLines={2}>
              {invoice.formData.dispatchAddress}
            </Text>
            <Text style={styles.text}>{invoice.formData.phoneNumber}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.columnWrapper}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.text} numberOfLines={2}>
              {invoice.selectedCustomer.name}
            </Text>
            <Text style={styles.text} numberOfLines={2}>
              {invoice.selectedCustomer.companyName}
            </Text>
            <Text style={styles.text} numberOfLines={2}>
              {invoice.selectedCustomer.email}
            </Text>
            <Text style={styles.text}>{invoice.selectedCustomer.phone}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.itemsHeaderSection]}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.tableHeader}>
          <View style={styles.colItem}>
            <Text style={styles.headerText}>Item</Text>
          </View>
          <View style={styles.colQty}>
            <Text style={[styles.headerText, styles.textRight]}>Qty</Text>
          </View>
          <View style={styles.colPrice}>
            <Text style={[styles.headerText, styles.textRight]}>Price</Text>
          </View>
          <View style={styles.colTotal}>
            <Text style={[styles.headerText, styles.textRight]}>Total</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View>
      <View style={styles.itemsFooterSection} />

      <View style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Subtotal:</Text>
          <Text style={styles.totalAmount}>₹{invoice.totals.subtotal}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Tax ({invoice.taxValue}%):</Text>
          <Text style={styles.totalAmount}>₹{invoice.totals.taxAmount}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>
            Discount ({invoice.discountValue}%):
          </Text>
          <Text style={styles.totalAmount}>
            ₹{invoice.totals.discountAmount}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.noBorderTop]}>
          <Text style={[styles.totalText, styles.grandTotalLabel]}>
            Grand Total:
          </Text>
          <Text style={[styles.totalAmount, { fontSize: size(18) }]}>
            ₹{invoice.totals.grandTotal}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms</Text>
        {invoice.formData.terms.map((term, index) => (
          <Text key={index} style={styles.text}>
            • {term}
          </Text>
        ))}
        <Text style={[styles.sectionTitle, styles.marginTop16]}>Notes</Text>
        <Text style={styles.text}>{invoice.formData.notes}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          disabled={download}
          style={[
            styles.button,
            styles.downloadButton,
            download && styles.disabledButton,
          ]}
          onPress={() => generatePDF(invoice, true)}
        >
          <Ionicons name="download" size={20} color={colors.white} />
          <Text style={styles.buttonText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={download}
          onPress={() => generatePDF(invoice, false)}
          style={[
            styles.button,
            styles.editButton,
            download && styles.disabledButton,
          ]}
        >
          <Ionicons name="share" size={20} color={colors.white} />
          <Text style={styles.buttonText}>Share Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.neutralBackground]}
      style={styles.flexContainer}
    >
      <FlashList
        data={invoice.currentInvoice.items}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.container}
      />

      {/* Updated Success Modal with onShare prop */}
      <SuccessModal
        visible={successModalVisible}
        onClose={() => setSuccessModalVisible(false)}
        onShare={handleShareSavedFile}
        message="Invoice PDF downloaded successfully."
        path={savedFilePath}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(16),
    color: colors.textSecondary,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.text.Primary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    color: colors.black,
    fontFamily: fonts.poppinsRegular,
    fontSize: size(13),
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  columnWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  sectionTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.primary,
    marginBottom: 12,
  },
  text: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
    marginBottom: 4,
    flexShrink: 1,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  headerText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(12),
    color: colors.text.Primary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: size(13),
    color: colors.text.Primary,
    fontFamily: fonts.poppinsRegular,
    textAlign: "right",
  },
  itemTextName: {
    fontSize: size(13),
    color: colors.text.Primary,
    fontFamily: fonts.poppinsMedium,
    textAlign: "left",
  },
  textBold: {
    fontFamily: fonts.poppinsBold,
  },
  textRight: {
    textAlign: "right",
  },
  colItem: {
    flex: 4,
    paddingRight: 8,
  },
  colQty: {
    flex: 1.5,
  },
  colPrice: {
    flex: 2,
  },
  colTotal: {
    flex: 2.5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  totalText: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(16),
    color: colors.text.Primary,
  },
  totalAmount: {
    fontSize: size(16),
    color: colors.primary,
  },
  noBorderTop: {
    borderTopWidth: 0,
  },
  grandTotalLabel: {
    color: colors.primary,
  },
  marginTop16: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: colors.azureblue,
  },
  editButton: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
    fontSize: size(14),
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  itemContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContainerAlt: {
    backgroundColor: "#fafafa",
  },
  itemsHeaderSection: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 16,
  },
  itemsFooterSection: {
    backgroundColor: colors.white,
    height: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
  },
});

export default InvoiceDetailScreen;
