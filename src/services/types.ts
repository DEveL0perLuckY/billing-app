import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UserDetails {
  fullName: string;
  phoneNumber: string;
  companyName: string;
  dispatchAddress: string;
  notes: string;
  terms: string[];
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  gstNumber?: string;
  companyName: string;
  billingAddress: string;
  shippingAddress: string;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  barcodeId?: string;
  totalStockIn?: number;
  totalStockOut?: number;
}

export interface StockTransaction {
  id?: string;
  productId: string;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  date: FirebaseFirestoreTypes.Timestamp | Date;
  relatedId?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface InvoiceTotals {
  subtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  grandTotal: string | number;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp | Date;
  formData: UserDetails;
  selectedCustomer: Customer;
  currentInvoice: {
    items: InvoiceItem[];
  };
  taxValue: number | string;
  discountValue: number | string;
  totals: InvoiceTotals;
}

export type InvoiceCreationData = Omit<
  Invoice,
  "id" | "invoiceNumber" | "createdAt"
>;

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | Date;
  totals: { grandTotal: string | number };
  selectedCustomer: { name: string };
  formData: { companyName: string };
}

export interface PaginatedInvoicesResponse {
  invoices: InvoiceSummary[];
  lastVisible: FirebaseFirestoreTypes.DocumentSnapshot | null;
  hasMore: boolean;
}
