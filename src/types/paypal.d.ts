
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: (data: any, actions: any) => Promise<string>;
        onApprove: (data: any, actions: any) => Promise<void>;
        onError?: (error: any) => void;
        onCancel?: (data: any) => void;
        style?: {
          layout?: 'vertical' | 'horizontal';
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
          shape?: 'rect' | 'pill';
          label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment';
          tagline?: boolean;
          height?: number;
        };
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
      
      // Additional PayPal SDK methods
      getFundingSources?: () => string[];
      rememberFunding?: (fundingSources: string[]) => void;
      
      // Order actions
      order?: {
        create: (orderData: any) => Promise<string>;
        capture: (orderId: string) => Promise<any>;
        get: (orderId: string) => Promise<any>;
      };
    };
  }
}

// PayPal Order interfaces
export interface PayPalOrderRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: PayPalPurchaseUnit[];
  application_context?: PayPalApplicationContext;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  amount: PayPalAmount;
  description?: string;
  custom_id?: string;
  invoice_id?: string;
  soft_descriptor?: string;
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
  breakdown?: PayPalAmountBreakdown;
}

export interface PayPalAmountBreakdown {
  item_total?: PayPalMoney;
  shipping?: PayPalMoney;
  handling?: PayPalMoney;
  tax_total?: PayPalMoney;
  insurance?: PayPalMoney;
  shipping_discount?: PayPalMoney;
  discount?: PayPalMoney;
}

export interface PayPalMoney {
  currency_code: string;
  value: string;
}

export interface PayPalApplicationContext {
  brand_name?: string;
  locale?: string;
  landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
  shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
  user_action?: 'CONTINUE' | 'PAY_NOW';
  payment_method?: {
    payer_selected?: string;
    payee_preferred?: 'UNRESTRICTED' | 'IMMEDIATE_PAYMENT_REQUIRED';
  };
  return_url?: string;
  cancel_url?: string;
}

// PayPal Response interfaces
export interface PayPalOrderResponse {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
  create_time?: string;
  update_time?: string;
  links?: PayPalLink[];
}

export interface PayPalPayer {
  name?: PayPalName;
  email_address?: string;
  payer_id?: string;
  address?: PayPalAddress;
}

export interface PayPalName {
  given_name?: string;
  surname?: string;
}

export interface PayPalAddress {
  address_line_1?: string;
  address_line_2?: string;
  admin_area_2?: string;
  admin_area_1?: string;
  postal_code?: string;
  country_code?: string;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'CONNECT' | 'OPTIONS' | 'PATCH';
}

export {};