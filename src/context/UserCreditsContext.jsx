import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import axios from "axios";
import { apiEndpoints } from "../utils/apiEndpoints";
import toast from "react-hot-toast";

export const UserCreditsContext = createContext();

export const extractCredits = (data) => {
  const parseNum = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return Number(val);
    return null;
  };

  const direct = parseNum(data);
  if (direct !== null) return direct;

  if (!data || typeof data !== 'object') return null;

  const fields = ['credits', 'creditsLeft', 'remainingCredits', 'userCredits', 'credit', 'balance', 'availableCredits', 'totalCredits'];
  for (const field of fields) {
    const val = parseNum(data[field]);
    if (val !== null) return val;
  }

  if (data.data) {
    const nestedData = extractCredits(data.data);
    if (nestedData !== null) return nestedData;
  }

  if (data.user) {
    const nestedUser = extractCredits(data.user);
    if (nestedUser !== null) return nestedUser;
  }

  return null;
};

export const UserCreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const loggedTokenRef = useRef(null);

  // Function to fetch the user credits directly from the backend
  const fetchUserCredits = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);

    try {
      const token = await getToken();
      console.log('Clerk JWT Token:', token);
      if (loggedTokenRef.current !== token) {
        loggedTokenRef.current = token;
      }
      const response = await axios.get(apiEndpoints.GET_CREDITS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('GET_CREDITS backend response:', response.data);

      if (response.status === 200) {
        const fetchedCredits = extractCredits(response.data);
        if (fetchedCredits !== null) {
          setCredits(fetchedCredits);
        }
      } else {
        toast.error('Unable to get the credits.');
      }
    } catch (error) {
      console.error('Error fetching the user credits from backend:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserCredits();

      const handleCreditsUpdated = () => {
        fetchUserCredits();
        // Secondary fetch after delay to ensure backend database transaction is fully committed
        setTimeout(() => {
          fetchUserCredits();
        }, 500);
      };

      window.addEventListener('creditsUpdated', handleCreditsUpdated);
      return () => window.removeEventListener('creditsUpdated', handleCreditsUpdated);
    }
  }, [fetchUserCredits, isSignedIn]);

  const updateCredits = useCallback((newCredits) => {
    setCredits(newCredits);
  }, []);

  const contextValue = {
    credits,
    loading,
    setCredits,
    fetchUserCredits,
    updateCredits
  };

  return (
    <UserCreditsContext.Provider value={contextValue}>
      {children}
    </UserCreditsContext.Provider>
  );
};
