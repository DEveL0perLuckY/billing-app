import {
  Customer,
  InvoiceItem,
  InvoiceTotals,
  UserDetails,
} from "../services/types";

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  InvoiceDetail: {
    id?: string;
    invoiceId?: string;
    fromConfirmation?: boolean;
  };
  CreateInvoice: undefined;
  CustomerForm: { customer?: any };
  SelectCustomerModule: undefined;
  SelectProductModule: undefined;
  ConfirmationScreen: {
    formData: UserDetails;
    selectedCustomer: Customer;
    currentInvoice: { items: InvoiceItem[] };
    taxValue: string | number;
    discountValue: string | number;
    totals: InvoiceTotals;
  };
  InventoryStats: undefined;
  Bills: undefined;
};
