import React, { useState, useContext } from 'react';
import DashboardLayout from '@/Layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, ShieldCheck, CreditCard, ArrowRight, HelpCircle, ChevronDown, Award } from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiEndpoints } from '@/utils/apiEndpoints';
import { UserCreditsContext } from '@/context/UserCreditsContext';

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for getting started with personal file sharing.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 5,
    features: [
      '5 File Credits',
      'Standard Download Speed',
      'Basic Link Protection',
      '24-Hour File Expiry Option',
      'Community Support'
    ],
    popular: false,
    color: 'border-slate-200',
    buttonVariant: 'secondary'
  },
  {
    id: 'premium',
    name: 'Premium Pro',
    description: 'Best for power users needing substantial storage & speed.',
    monthlyPrice: 499,
    yearlyPrice: 4799,
    credits: 500,
    features: [
      '500 File Credits',
      'High-Speed CDN Transfers',
      'Password Protected Share Links',
      'Custom Expiry Controls',
      'Priority Email Support',
      'Detailed Download Analytics'
    ],
    popular: true,
    color: 'border-violet-500 shadow-violet-500/10',
    buttonVariant: 'primary'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Unlimited',
    description: 'Unrestricted access for high volume users and teams.',
    monthlyPrice: 999,
    yearlyPrice: 9599,
    credits: 5000,
    features: [
      '5,000 File Credits',
      'Ultra Fast Express Downloads',
      'Advanced Security Encryption',
      'Unlimited Expiry Timeframe',
      '24/7 Dedicated Priority Support',
      'Full Audit Logs & Webhooks'
    ],
    popular: false,
    color: 'border-indigo-200',
    buttonVariant: 'outline'
  }
];

const faqs = [
  {
    q: 'How do file credits work?',
    a: 'Each credit allows you to upload and host one file on CloudShare. When you upload a file, 1 credit is consumed.'
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes! You can upgrade your plan whenever you need more credits. Your new balance will be updated instantly upon payment verification.'
  },
  {
    q: 'What payment methods do you support?',
    a: 'We support all major payment options including UPI, Credit/Debit Cards, Net Banking, and popular Wallets via our secure gateway.'
  },
  {
    q: 'What happens when I run out of credits?',
    a: 'If you exhaust your credit limit, existing shared files remain active, but you won\'t be able to upload new files until you upgrade or replenish credits.'
  }
];

const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { getToken } = useAuth();
  const { credits, fetchUserCredits } = useContext(UserCreditsContext);

  const handleSubscribe = async (plan) => {
    if (plan.monthlyPrice === 0) {
      toast.success('You are currently on the Free Basic Plan.');
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const token = await getToken();
      const rawAmount = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      const amountInPaisa = rawAmount * 100;

      // 1. Create order on backend
      const orderResponse = await axios.post(
        apiEndpoints.CREATE_ORDER,
        {
          amount: amountInPaisa,
          currency: 'INR',
          planId: plan.id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (orderResponse.status === 200 && orderResponse.data?.success) {
        const orderData = orderResponse.data;

        // Open Razorpay Popup
        if (window.Razorpay && orderData.orderId) {
          const razorpayKey = orderData.key || orderData.keyId || orderData.razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID;

          if (!razorpayKey || razorpayKey === 'YOUR_RAZORPAY_KEY_ID_HERE' || razorpayKey === 'rzp_test_KEY') {
            toast.error('Missing Razorpay Key ID! Please set VITE_RAZORPAY_KEY_ID in .env or return key in createOrder response.', { duration: 6000 });
            return;
          }

          const options = {
            key: razorpayKey,
            amount: amountInPaisa,
            currency: 'INR',
            name: 'CloudShare',
            description: `${plan.name} Subscription`,
            order_id: orderData.orderId,
            handler: async function (response) {
              try {
                // 2. Fetch fresh JWT token for verification request
                const freshToken = await getToken();
                
                // Verify payment on backend matching PaymentVerificationDTO
                const verifyRes = await axios.post(
                  apiEndpoints.VERIFY_PAYMENT,
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    planId: plan.id
                  },
                  {
                    headers: { Authorization: `Bearer ${freshToken}` }
                  }
                );

                if (verifyRes.data?.success) {
                  toast.success(verifyRes.data.message || 'Payment verified! Credits added successfully.');
                  fetchUserCredits();
                } else {
                  toast.error(verifyRes.data?.message || 'Payment verification failed.');
                }
              } catch (err) {
                console.error('Payment verification error details:', err.response?.data || err);
                const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error verifying payment.';
                toast.error(`Verification Failed (403): ${errMsg}`);
              }
            },
            theme: { color: '#7c3aed' }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.error(orderData.message || 'Failed to initialize payment gateway.');
        }
      } else {
        toast.error(orderResponse.data?.message || 'Failed to create payment order.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 py-4 px-2 sm:px-4">
        {/* Animated Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/80 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-xs font-semibold tracking-wide border border-violet-200/50 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-violet-600" />
            Flexible Credit Plans
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Upgrade Your Storage &{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Supercharge CloudShare
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
            Choose the perfect plan to get more credits, unlock higher speed transfers, and secure your files effortlessly.
          </p>

          {/* Current Credit Status Bar */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-2.5 rounded-2xl shadow-lg border border-slate-700/50 text-sm mt-2"
          >
            <div className="p-1.5 bg-violet-500/20 text-violet-400 rounded-lg">
              <Zap className="w-4 h-4 fill-violet-400" />
            </div>
            <span>Current Balance: <strong className="text-violet-300 font-bold">{credits} Credits</strong> remaining</span>
          </motion.div>
        </motion.div>

        {/* Billing Cycle Toggle Switch */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center items-center gap-4"
        >
          <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
            Monthly Billing
          </span>

          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner"
            aria-label="Toggle Billing Cycle"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-md"
              style={{
                marginLeft: billingCycle === 'yearly' ? '24px' : '0px'
              }}
            />
          </button>

          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
              Annual Billing
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm animate-bounce">
              Save 20%
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, index) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className={`relative bg-white rounded-3xl p-8 border ${plan.color} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  plan.popular ? 'ring-2 ring-violet-500 shadow-violet-500/10' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-l from-violet-600 to-indigo-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tag */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{plan.description}</p>
                  </div>

                  {/* Price Tag */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">
                        {price === 0 ? 'Free' : `₹${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-slate-400 font-medium">/ month</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-1">
                        Billed annually (₹{plan.yearlyPrice}/yr)
                      </p>
                    )}
                  </div>

                  {/* Credits Highlight */}
                  <div className="flex items-center gap-2 p-3 bg-violet-50/70 rounded-xl mb-6 border border-violet-100/60">
                    <Zap className="w-4 h-4 text-violet-600 fill-violet-600" />
                    <span className="text-xs font-bold text-violet-900">
                      Includes {plan.credits} File Credits
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features included:</p>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-3 text-xs text-slate-600">
                        <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25'
                      : plan.monthlyPrice === 0
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{plan.monthlyPrice === 0 ? 'Current Plan' : 'Get Started Now'}</span>
                      {plan.monthlyPrice !== 0 && <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Security Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-violet-100 text-violet-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">100% Encrypted & Secure Payments</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All transactions are processed securely via encrypted Payment Gateways. Cancel anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200/70 shadow-sm">
            <CreditCard className="w-4 h-4 text-violet-600" />
            <span>Instant Credit Delivery</span>
          </div>
        </motion.div>

        {/* Animated FAQs Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="space-y-6 pt-4 max-w-3xl mx-auto"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Got Questions? We’ve Got Answers.</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-800 text-sm hover:text-violet-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-2"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
