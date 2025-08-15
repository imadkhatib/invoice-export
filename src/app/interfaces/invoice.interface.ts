export interface PersonalDetails {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  amount: number;
  invoiceDate: string;
}

export interface InvoiceFormData {
  personalDetails: PersonalDetails;
  invoiceDetails: InvoiceDetails;
  signature: string;
}

export interface InvoiceApiRequest {
  personalDetails: PersonalDetails;
  invoiceDetails: InvoiceDetails;
  invoicePdfFile: File;
}

export interface InvoiceApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface InvoiceSubmissionResult {
  success: boolean;
  message: string;
  invoiceId?: string;
}
