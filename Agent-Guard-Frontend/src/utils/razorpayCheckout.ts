import { razorpayApi, RAZORPAY_KEY_ID } from '../services/api';

export interface RazorpayPaymentSuccessData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  verified: boolean;
  message?: string;
  amount: number;
  recipientName: string;
  upiId: string;
  timestamp: string;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag is already in DOM (e.g. from index.html)
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).Razorpay) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts > 60) { // 3 seconds timeout
          clearInterval(checkInterval);
          resolve(Boolean((window as any).Razorpay));
        }
      }, 50);

      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  amount,
  recipientName,
  upiId,
  transactionId,
  status = 'SAFE',
  cachedOrder,
  onSuccess,
  onDismiss,
  onError,
}: {
  amount: number;
  recipientName: string;
  upiId: string;
  transactionId: string;
  status?: string;
  cachedOrder?: any;
  onSuccess: (data: RazorpayPaymentSuccessData) => void;
  onDismiss: () => void;
  onError: (error: string) => void;
}) {
  try {
    // Zero-tolerance check: Never allow Razorpay checkout for BLOCKED transactions
    const normalizedStatus = (status || '').toUpperCase();
    if (normalizedStatus === 'BLOCKED' || normalizedStatus === 'BLOCK' || normalizedStatus === 'CRITICAL') {
      onError('Razorpay Checkout is prohibited: Transaction BLOCKED by AgentGuard Zero-Trust Sentinel.');
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded && !(window as any).Razorpay) {
      onError('Unable to load Razorpay Checkout SDK. Please check your network connection.');
      return;
    }

    // Step 1: Create Order via server-side endpoint or use pre-created order
    let orderData = cachedOrder;
    if (!orderData || !orderData.success) {
      orderData = await razorpayApi.createOrder({
        amount,
        currency: 'INR',
        recipientName,
        upiId,
        transactionId,
        status: normalizedStatus,
        notes: {
          transactionId,
          recipientName,
          upiId,
          status: normalizedStatus,
        },
      });
    }

    if (!orderData.success) {
      onError(orderData.error || 'Failed to initialize Razorpay order from backend.');
      return;
    }

    const formattedAmount = `₹${Number(amount).toLocaleString('en-IN')}`;
    const keyToUse = orderData.key_id || RAZORPAY_KEY_ID;

    // Build Razorpay standard checkout configuration
    const options: any = {
      key: keyToUse,
      amount: orderData.amount || Math.min(Math.round(amount * 100), 50000000), // in paise
      currency: orderData.currency || 'INR',
      name: 'AgentGuard — PayShield',
      description: `Payment of ${formattedAmount} to ${recipientName}`,
      image: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
      prefill: {
        name: 'Aryan Patel',
        email: 'aryan.patel@bank.in',
        contact: '9876543210',
      },
      notes: {
        recipientName,
        upiId,
        transactionId,
        intendedAmountINR: String(amount),
        formattedAmount,
        protectionEngine: 'AgentGuard Multi-Agent AI Sentinel (Test Mode)',
      },
      theme: {
        color: '#2563EB',
        backdrop_color: 'rgba(7, 11, 20, 0.85)',
      },
      modal: {
        ondismiss: function () {
          onDismiss();
        },
        escape: true,
        backdropclose: false,
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) {
        try {
          const orderIdToVerify = response.razorpay_order_id || orderData.order_id || '';
          const signatureToVerify = response.razorpay_signature || '';

          // Step 2: Verify HMAC-SHA256 signature on server endpoint (reading RAZORPAY_KEY_SECRET)
          const verifyResult = await razorpayApi.verifyPayment({
            razorpay_order_id: orderIdToVerify,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: signatureToVerify,
            transaction_id: transactionId,
          });

          if (verifyResult.verified) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: orderIdToVerify,
              razorpay_signature: signatureToVerify,
              verified: true,
              message: verifyResult.message || 'Payment completed and signature verified by server.',
              amount,
              recipientName,
              upiId,
              timestamp: new Date().toLocaleTimeString(),
            });
            return;
          } else {
            onError(verifyResult.message || 'Payment signature verification failed.');
          }
        } catch (err: any) {
          onError(err.message || 'Payment verification endpoint communication failed.');
        }
      },
    };

    // Only attach order_id if a valid server order was returned by the Razorpay API
    if (orderData.order_id && orderData.order_id.startsWith('order_')) {
      options.order_id = orderData.order_id;
    }

    if (typeof (window as any).Razorpay === 'function') {
      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', function (resp: any) {
        onError(resp.error?.description || 'Payment rejected by banking gateway.');
      });

      razorpayInstance.open();
    } else {
      onError('Razorpay Checkout SDK is not ready in this browser session.');
    }
  } catch (err: any) {
    onError(err.message || 'Failed to open Razorpay Checkout modal.');
  }
}
