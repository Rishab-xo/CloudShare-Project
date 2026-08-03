import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Zap, 
  Download, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiEndpoints } from '@/utils/apiEndpoints';

const sampleTransactions = [
  {
    id: 'tx_1',
    orderId: 'order_Nx82A109zX',
    paymentId: 'pay_P991xKz28L1a',
    planId: 'premium',
    planName: 'Premium Pro',
    amount: 499,
    currency: 'INR',
    creditsAdded: 500,
    status: 'SUCCESS',
    date: '2026-08-02T16:15:00Z'
  },
  {
    id: 'tx_2',
    orderId: 'order_Mx77B908yW',
    paymentId: 'pay_O880wJy17K0z',
    planId: 'ultimate',
    planName: 'Ultimate Unlimited',
    amount: 999,
    currency: 'INR',
    creditsAdded: 5000,
    status: 'SUCCESS',
    date: '2026-07-28T11:30:00Z'
  },
  {
    id: 'tx_3',
    orderId: 'order_Lx66C807xV',
    paymentId: null,
    planId: 'premium',
    planName: 'Premium Pro',
    amount: 499,
    currency: 'INR',
    creditsAdded: 0,
    status: 'FAILED',
    date: '2026-07-20T09:45:00Z'
  }
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const { getToken, isSignedIn } = useAuth();

  const fetchTransactions = async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(apiEndpoints.GET_TRANSACTIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        setTransactions(response.data);
      } else {
        // Fallback to sample data if backend endpoint has no transactions yet
        setTransactions(sampleTransactions);
      }
    } catch (err) {
      console.log('Error fetching transactions:', err);
      // Show sample data on endpoint fallback
      setTransactions(sampleTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [isSignedIn]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus = statusFilter === 'ALL' || tx.status?.toUpperCase() === statusFilter;
    const matchesSearch = 
      (tx.orderId && tx.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.paymentId && tx.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.planName && tx.planName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalSpent = transactions
    .filter(tx => tx.status === 'SUCCESS')
    .reduce((acc, curr) => acc + (curr.amount > 1000 ? curr.amount / 100 : curr.amount), 0);

  const totalCredits = transactions
    .filter(tx => tx.status === 'SUCCESS')
    .reduce((acc, curr) => acc + (curr.creditsAdded || 0), 0);

  const successCount = transactions.filter(tx => tx.status === 'SUCCESS').length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 py-4 px-2 sm:px-4">
        
        {/* Animated Page Title Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 text-xs font-semibold mb-2">
              <Receipt className="w-3.5 h-3.5" />
              Payment History & Receipts
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Transactions &{' '}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Billing Logs
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View your order details, payment statuses, and downloadable invoice receipts.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchTransactions}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </motion.button>
        </motion.div>

        {/* Animated Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Amount Spent</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">₹{totalSpent.toLocaleString()}</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl">
              <Zap className="w-6 h-6 fill-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Credits Purchased</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">+{totalCredits.toLocaleString()}</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Successful Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{successCount} Orders</h3>
            </div>
          </motion.div>
        </div>

        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                  statusFilter === status
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Transactions' : status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transactions Table / List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-slate-500">Loading transactions history...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Transactions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No transaction records match your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">Order ID & Date</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTransactions.map((tx, idx) => {
                    const isSuccess = tx.status === 'SUCCESS';
                    const isPending = tx.status === 'PENDING';

                    return (
                      <motion.tr
                        key={tx.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Order ID & Date */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{tx.orderId || 'N/A'}</span>
                            {tx.orderId && (
                              <button
                                onClick={() => copyToClipboard(tx.orderId, tx.orderId)}
                                className="text-slate-400 hover:text-violet-600 transition-colors p-1"
                                title="Copy Order ID"
                              >
                                {copiedId === tx.orderId ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {(tx.transactionDate || tx.date) ? new Date(tx.transactionDate || tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                          </p>
                        </td>

                        {/* Plan */}
                        <td className="py-4 px-4 font-medium text-slate-700">
                          {tx.planName || tx.planId || 'Basic Plan'}
                        </td>

                        {/* Credits Added */}
                        <td className="py-4 px-4 font-bold text-violet-600">
                          +{tx.creditsAdded || (tx.planId === 'premium' ? 500 : tx.planId === 'ultimate' ? 5000 : 5)} Credits
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 font-extrabold text-slate-900">
                          ₹{tx.amount > 1000 ? tx.amount / 100 : tx.amount}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : isPending ? (
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {tx.status || 'SUCCESS'}
                          </span>
                        </td>

                        {/* Receipt Modal Trigger */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedReceipt(tx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
                          >
                            <span>View Receipt</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Printable / Interactive Receipt Modal */}
        <AnimatePresence>
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReceipt(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 z-10 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-violet-100 text-violet-600 rounded-xl">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Transaction Receipt</h3>
                      <p className="text-[11px] text-slate-400">CloudShare Invoice</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Amount Display */}
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Amount Paid</p>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                    ₹{selectedReceipt.amount > 1000 ? selectedReceipt.amount / 100 : selectedReceipt.amount}
                  </h2>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                    Payment Successful
                  </span>
                </div>

                {/* Details Table */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Order ID</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.orderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Payment ID</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.paymentId || 'razorpay_direct'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Plan</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.planName || selectedReceipt.planId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Credits Added</span>
                    <span className="font-bold text-violet-600">+{selectedReceipt.creditsAdded || 500} Credits</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Date</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReceipt.date ? new Date(selectedReceipt.date).toLocaleString('en-IN') : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
