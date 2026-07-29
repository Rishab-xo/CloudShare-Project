import React, { useEffect, useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import axios from 'axios';
import { apiEndpoints } from '@/utils/apiEndpoints';

/**
 * CreditsDisplay Component
 * Shows user's credit usage with a progress bar, status text, and upgrade action.
 */
const CreditsDisplay = ({ credits: defaultCredits = 0, maxCredits: defaultMaxCredits = 100 }) => {
  const [credits, setCredits] = useState(defaultCredits);
  const [maxCredits, setMaxCredits] = useState(defaultMaxCredits);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(apiEndpoints.GET_USER_CREDITS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200 && response.data !== undefined) {
          let fetchedCredits = defaultCredits;
          let fetchedMax = defaultMaxCredits;

          if (typeof response.data === 'number') {
            fetchedCredits = response.data;
          } else if (typeof response.data === 'object' && response.data !== null) {
            fetchedCredits = response.data.credits ?? response.data.usedCredits ?? response.data.creditsUsed ?? response.data.currentCredits ?? defaultCredits;
            fetchedMax = response.data.maxCredits ?? response.data.totalCredits ?? response.data.limit ?? defaultMaxCredits;
          }

          setCredits(fetchedCredits);
          setMaxCredits(fetchedMax);
        }
      } catch (err) {
        console.log('Error fetching credits from backend:', err);
      }
    };

    fetchCredits();

    // Listen for custom event when upload or action completes
    window.addEventListener('creditsUpdated', fetchCredits);
    return () => window.removeEventListener('creditsUpdated', fetchCredits);
  }, [getToken]);

  const percentage = Math.min(100, Math.max(0, Math.round((credits / maxCredits) * 100)));
  const isNearLimit = percentage >= 85;

  return (
    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
      {/* Icon + Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Credits Usage</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isNearLimit 
              ? 'bg-gradient-to-r from-rose-500 to-red-600' 
              : 'bg-gradient-to-r from-violet-600 to-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Usage details */}
      <div className="flex items-center justify-between text-xs mb-3 text-slate-500">
        <span>{credits} of {maxCredits} credits</span>
        {isNearLimit && <span className="text-rose-500 font-medium">Running low</span>}
      </div>

      {/* CTA Button */}
      <Link
        to="/subscriptions"
        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-xl transition-all shadow-sm shadow-violet-600/10 cursor-pointer"
      >
        <Zap className="w-3.5 h-3.5" />
        Upgrade / Get More
      </Link>
    </div>
  );
};

export default CreditsDisplay;
