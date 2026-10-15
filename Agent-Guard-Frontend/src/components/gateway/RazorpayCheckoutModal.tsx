import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

export interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  recipientName: string;
  upiId: string;
  orderId?: string;
  isHighValueSimulated?: boolean;
  onSuccess: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verified: boolean;
    message: string;
    amount: number;
    recipientName: string;
    upiId: string;
    timestamp: string;
  }) => void;
  onDismiss: () => void;
  onError: (errorMsg: string) => void;
}

type PaymentMethod = 'upi' | 'card' | 'netbanking';
type PaymentStep = 'select' | 'authorizing' | 'success' | 'declined';

export const RazorpayCheckoutModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  recipientName,
  upiId,
  orderId,
  isHighValueSimulated = false,
  onSuccess,
  onDismiss,
  onError,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [step, setStep] = useState<PaymentStep>('select');
  const [authStageText, setAuthStageText] = useState('Connecting to NPCI gateway...');

  // Form states
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom'>('gpay');
  const [customUpi, setCustomUpi] = useState('payer@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardName, setCardName] = useState('Aryan Chippa');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setAuthStageText('Connecting to NPCI gateway...');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedAmount = `₹${Number(amount).toLocaleString('en-IN')}`;
  const effectiveOrderId = orderId || `order_ag_${Date.now()}`;

  const handleAuthorize = async () => {
    setStep('authorizing');
    setAuthStageText('Contacting issuing bank gateway...');

    await new Promise((r) => setTimeout(r, 600));
    setAuthStageText('Validating 3D-Secure 2.0 authorization token...');

    await new Promise((r) => setTimeout(r, 600));
    setAuthStageText('Signing cryptographic HMAC-SHA256 receipt...');

    await new Promise((r) => setTimeout(r, 500));
    const paymentId = `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const signature = `sig_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    setStep('success');

    await new Promise((r) => setTimeout(r, 450));
    onSuccess({
      razorpay_payment_id: paymentId,
      razorpay_order_id: effectiveOrderId,
      razorpay_signature: signature,
      verified: true,
      message: 'Payment completed successfully through Razorpay Gateway.',
      amount,
      recipientName,
      upiId,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleSimulateDecline = () => {
    setStep('declined');
    setTimeout(() => {
      onError('Payment declined by issuing bank (Test simulation: Insufficient funds or card restriction).');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-lg rounded-2xl bg-[#0B132B] border border-blue-500/30 shadow-2xl shadow-black overflow-hidden text-slate-100 font-sans"
      >
        {/* Top Razorpay Header Bar */}
        <div className="bg-gradient-to-r from-[#0F2042] via-[#0C1A38] to-[#0A1630] border-b border-blue-900/40 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/30">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Razorpay <span className="text-blue-400 font-mono text-xs font-semibold">Gateway</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Test Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Merchant: <span className="text-slate-200 font-medium">AgentGuard AI Guardian</span>
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            disabled={step === 'authorizing'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Beneficiary Banner */}
        <div className="bg-[#080E21] px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Paying Beneficiary
            </span>
            <span className="text-xs font-semibold text-white block">
              {recipientName} <span className="text-slate-400 font-mono font-normal">({upiId})</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {formattedAmount}
            </span>
            {isHighValueSimulated && (
              <span className="text-[9px] font-mono text-cyan-400 block">High-Value Sandbox Auth</span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {step === 'select' && (
            <div>
              {/* Method Tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'upi'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'card'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    method === 'netbanking'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* UPI Tab View */}
              {method === 'upi' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">Select UPI Application:</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'gpay', label: 'Google Pay', icon: '🟢', sub: 'Instant 1-Click' },
                      { id: 'phonepe', label: 'PhonePe', icon: '🟣', sub: 'UPI Linked' },
                      { id: 'paytm', label: 'Paytm UPI', icon: '🔵', sub: 'Verified' },
                      { id: 'custom', label: 'Other UPI ID', icon: '⚡', sub: 'Manual Entry' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedUpiApp === app.id
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{app.icon}</span>
                          <span className="text-xs font-semibold">{app.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 ml-6">{app.sub}</span>
                      </button>
                    ))}
                  </div>

                  {selectedUpiApp === 'custom' && (
                    <div className="mt-3">
                      <label className="text-[11px] text-slate-400 font-mono block mb-1">Enter UPI VPA:</label>
                      <input
                        type="text"
                        value={customUpi}
                        onChange={(e) => setCustomUpi(e.target.value)}
                        placeholder="username@bank"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Cards Tab View */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-900/60 border border-blue-500/20 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>TEST CARD AUTO-FILLED</span>
                      <span className="text-emerald-400 font-bold">VISA DEBIT</span>
                    </div>
                    <div className="text-sm font-semibold text-white tracking-widest mt-2">{cardNumber}</div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-300">
                      <span>EXP: {cardExpiry}</span>
                      <span>CVV: {cardCvv}</span>
                      <span>{cardName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono block mb-0.5">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-mono block mb-0.5">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Netbanking Tab View */}
              {method === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-300 block">Select Partner Bank:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(
                      (bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🏦 {bank}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Primary Authorization Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAuthorize}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>AUTHORIZE & PAY {formattedAmount}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleSimulateDecline}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline py-1 px-2 cursor-pointer"
                  >
                    Simulate Bank Decline
                  </button>

                  <button
                    type="button"
                    onClick={onDismiss}
                    className="text-[11px] text-slate-400 hover:text-slate-200 py-1 px-2 cursor-pointer"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'authorizing' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-blue-400 text-xs font-mono font-bold">
                  ₹
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Authorizing Payment...</h4>
                <p className="text-xs text-blue-400 font-mono mt-1 animate-pulse">{authStageText}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Please do not refresh or close this window.
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-3">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h4 className="text-base font-bold text-emerald-300">Payment Authorization Approved</h4>
              <p className="text-xs text-slate-300 font-mono">
                {formattedAmount} securely cleared to {recipientName}
              </p>
              <span className="text-[11px] text-emerald-400/80 font-mono block">
                Recording HMAC-SHA256 hash in cryptographic ledger...
              </span>
            </div>
          )}

          {step === 'declined' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-rose-400">Payment Authorization Declined</h4>
              <p className="text-xs text-slate-300">
                The simulated transaction was rejected by the banking gateway.
              </p>
            </div>
          )}
        </div>

        {/* Footer Security Watermark */}
        <div className="bg-[#070B14] px-5 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-Bit TLS Secured Gateway</span>
          </div>
          <span>Order: {effectiveOrderId.slice(0, 16)}...</span>
        </div>
      </motion.div>
    </div>
  );
};
