import React, { useContext } from "react";
import { CreditCard } from "lucide-react";
import { UserCreditsContext } from "@/context/UserCreditsContext";

const CreditsDisplay = ({ credits: propCredits }) => {
  const { credits: contextCredits } = useContext(UserCreditsContext) || {};
  const credits = propCredits !== undefined ? propCredits : (contextCredits ?? 0);

  return (
    <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-blue-700">
      <CreditCard size={16} />
      <span className="font-medium">{credits}</span>
      <span className="text-xs">Credits</span>
    </div>
  );
};

export default CreditsDisplay;
