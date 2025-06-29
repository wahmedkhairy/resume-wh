
declare global {
  interface Window {
    paypal: {
      Buttons: (config: {
        createOrder: (data: any, actions: any) => Promise<string>;
        onApprove: (data: any, actions: any) => Promise<void>;
        onError?: (error: any) => void;
        onCancel?: (data: any) => void;
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
        };
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

export {};
