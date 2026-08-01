import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import axios from "axios";
import { apiEndpoints } from "../utils/apiEndpoints";
import toast from "react-hot-toast";

export const UserCreditsContext = createContext();

export const UserCreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(5);
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const loggedTokenRef = useRef(null);

  // Function to fetch the user credits that can be called from anywhere
  const fetchUserCredits = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);

    try {
      const token = await getToken();
      if (loggedTokenRef.current !== token) {
        console.log(token);
        loggedTokenRef.current = token;
      }
      const response = await axios.get(apiEndpoints.GET_CREDITS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Support response.data.credits or direct response.data
        const fetchedCredits = typeof response.data === 'number' 
          ? response.data 
          : (response.data?.credits ?? 5);
        setCredits(fetchedCredits);
      } else {
        toast.error('Unable to get the credits.');
      }
    } catch (error) {
      console.error('Error fetching the user credits', error);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserCredits();
      window.addEventListener('creditsUpdated', fetchUserCredits);
      return () => window.removeEventListener('creditsUpdated', fetchUserCredits);
    }
  }, [fetchUserCredits, isSignedIn]);

  const updateCredits = useCallback((newCredits) => {
    console.log('Updating the credits', newCredits);
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
