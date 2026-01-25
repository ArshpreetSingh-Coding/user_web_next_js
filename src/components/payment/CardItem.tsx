import React from "react";
import { CreditCard } from "lucide-react";
import { StripeCard } from "@/hooks/usePayment";

interface CardItemProps {
  card: StripeCard;
  selected: boolean;
  onClick: () => void;
}

/**
 * CardItem Component
 * Displays a saved Stripe card with brand, last 4 digits, and expiry
 */
export function CardItem({ card, selected, onClick }: CardItemProps) {
  // console.log("Rendering CardItem for card:", card);
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }`}
    >
      {/* Card Icon */}
      <div className={`p-3 rounded-lg ${selected ? "bg-primary/10" : "bg-gray-100"}`}>
        <CreditCard className={`h-6 w-6 ${selected ? "text-primary" : "text-gray-600"}`} />
      </div>

      {/* Card Details */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 capitalize">{card.brand}</span>
          <span className="text-gray-500">****{card.last_4}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          Expires {card.exp_month}/{card.exp_year}
        </p>
      </div>

      {/* Selection Indicator */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-gray-300"
          }`}
      >
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}
