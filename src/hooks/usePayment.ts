import { useState, useEffect } from "react";
import { useBookingStore } from "@/stores/booking.store";
import { useAuthStore } from "@/stores/auth.store";
import apiClient from "@/lib/api/client";
import { PaymentResponse } from "@/types";
import { toast } from "sonner";
import { SquareCardData } from "@/lib/api/payment/square-card.api";

// Types for payment data
export interface StripeCard {
  id: number | string;
  card_id: string;
  last_4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  name?: string;
}

export interface PaymentDetails {
  stripeCards: StripeCard[];
  squareCards: SquareCardData[];
  isStripeEnabled: number;
  isSquareEnabled: number;
  walletBalance: number;
  paymentModeLoaded: boolean;
  stripePublishableKey?: string; // Stripe publishable key for card addition
  squareApplicationId?: string; // Square application ID
  squareLocationId?: string; // Square location ID
}

/**
 * Custom hook to manage payment methods and card details
 * 
 * This hook:
 * 1. Fetches wallet and payment method details from the API
 * 2. Manages loading states
 * 3. Provides saved Stripe cards
 * 4. Determines which payment methods are enabled
 */
export function usePayment() {
  const { pickup } = useBookingStore();
  const { sessionId, sessionIdentifier } = useAuthStore();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    stripeCards: [],
    squareCards: [],
    isStripeEnabled: 0,
    isSquareEnabled: 0,
    walletBalance: 0,
    paymentModeLoaded: false,
    stripePublishableKey: undefined,
    squareApplicationId: undefined,
    squareLocationId: undefined,
  });
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StripeCard | null>(null);
  const [selectedSquareCard, setSelectedSquareCard] = useState<SquareCardData | null>(null);

  /**
   * Refresh payment details (call after adding/deleting cards)
   */
  const refreshPaymentDetails = async () => {
    console.log('🔄 refreshPaymentDetails called');
    console.log('Pickup:', pickup);
    console.log('Session:', { sessionId, sessionIdentifier });

    if (!pickup?.lat || !pickup?.lng || !sessionId || !sessionIdentifier) {
      console.warn('⚠️ Missing required data for refresh:', {
        hasPickup: !!pickup,
        hasLat: !!pickup?.lat,
        hasLng: !!pickup?.lng,
        hasSessionId: !!sessionId,
        hasSessionIdentifier: !!sessionIdentifier,
      });
      return;
    }

    try {
      setIsLoadingPayment(true);

      const reqBody = {
        latitude: pickup.lat,
        longitude: pickup.lng,
      };

      const response = await apiClient.post('/open/v1/fetch_wallet_balance', reqBody);
      const data = response.data;

      if (data.flag !== 200 && data.flag !== 143) {
        throw new Error(data.error || data.message || "Failed to fetch payment details");
      }

      const responseData = data.data;
      const stripeConfig = responseData.payment_mode_config_data
        ?.find((item: any) => item.name === "stripe_cards");
      const squareConfig = responseData.payment_mode_config_data
        ?.find((item: any) => item.name === "square_card");


      console.log("stripe Config -> ", stripeConfig);
      console.log("square Config -> ", squareConfig);
      setPaymentDetails({
        stripeCards: responseData.stripe_cards || [],
        squareCards: responseData.square_cards || squareConfig?.cards_data || [],
        isStripeEnabled: stripeConfig
          ? stripeConfig.stripe_3d_enabled || stripeConfig.enabled
          : 0,
        isSquareEnabled: squareConfig?.enabled || 0,
        walletBalance: responseData.jugnoo_balance || 0,
        paymentModeLoaded: true,
        stripePublishableKey: stripeConfig?.stripe_publishable_key || responseData.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        squareApplicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        squareLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      });

      console.log('🔄 Payment details refreshed');
    } catch (error: any) {
      console.error("❌ Failed to refresh payment details:", error);
      toast.error(error.message || "Failed to refresh payment methods");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  /**
   * Fetch wallet and payment method details from API
   * This includes:
   * - Available Stripe cards
   * - Stripe enabled status
   * - Wallet balance
   */
  useEffect(() => {
    async function fetchWalletDetails() {
      // Don't fetch if no pickup location or no session
      if (!pickup?.lat || !pickup?.lng || !sessionId || !sessionIdentifier) {
        return;
      }

      try {
        setIsLoadingPayment(true);

        const reqBody = {
          latitude: pickup.lat,
          longitude: pickup.lng,
        };

        const response = await apiClient.post('/open/v1/fetch_wallet_balance', reqBody);
        const data = response.data;

        console.log("Payment details response:", data);

        if (data.flag !== 143) {
          throw new Error(data.error || data.message || "Failed to fetch payment details");
        }

        const responseData = data.data;

        // Find Stripe configuration from payment modes
        const stripeConfig = responseData.payment_mode_config_data?.find(
          (item: any) => item.name === "stripe_cards"
        );
        const squareConfig = responseData.payment_mode_config_data?.find(
          (item: any) => item.name === "square_cards"
        );
        console.log("**********************", squareConfig, responseData.payment_mode_config_data);
        const isStripeEnabled = Number(stripeConfig?.enabled) === 1;
        const isStripe3DEnabled = Number(stripeConfig?.stripe_3d_enabled) === 1;
        const isSquareEnabled = Number(squareConfig?.enabled) === 1;
        console.log("is square enabled", isSquareEnabled)
        const stripeCards =
          responseData.stripe_cards?.length
            ? responseData.stripe_cards
            : stripeConfig?.cards_data || [];
        const squareCards =
          responseData.square_cards?.length
            ? responseData.square_cards
            : squareConfig?.cards_data || [];
        // Extract payment details
        setPaymentDetails({
          stripeCards,
          squareCards,
          isStripeEnabled: isStripeEnabled ? 1 : 0,
          isSquareEnabled: isSquareEnabled ? 1 : 0,
          walletBalance: responseData.jugnoo_balance || 0,
          paymentModeLoaded: true,
          stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          squareApplicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
          squareLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        });

        console.log('💳 Payment details loaded:', {
          stripeCardsCount: responseData.stripe_cards?.length || 0,
          squareCardsCount: responseData.square_cards?.length || 0,
          isStripeEnabled: stripeConfig ? stripeConfig.stripe_3d_enabled || stripeConfig.enabled : 0,
          isSquareEnabled: squareConfig?.enabled || 0,
        });

      } catch (error: any) {
        console.error("❌ Failed to fetch wallet details:", error);
        toast.error(error.message || "Failed to load payment methods");

        // Set failed state
        setPaymentDetails({
          stripeCards: [],
          squareCards: [],
          isStripeEnabled: 0,
          isSquareEnabled: 0,
          walletBalance: 0,
          paymentModeLoaded: false,
          stripePublishableKey: undefined,
          squareApplicationId: undefined,
          squareLocationId: undefined,
        });
      } finally {
        setIsLoadingPayment(false);
      }
    }

    fetchWalletDetails();
  }, [pickup, sessionId, sessionIdentifier]);

  return {
    paymentDetails,
    isLoadingPayment,
    selectedCard,
    setSelectedCard,
    selectedSquareCard,
    setSelectedSquareCard,
    hasStripeCards: paymentDetails.stripeCards.length > 0,
    hasSquareCards: paymentDetails.squareCards.length > 0,
    isStripeEnabled: paymentDetails.isStripeEnabled === 1,
    isSquareEnabled: paymentDetails.isSquareEnabled === 1,
    refreshPaymentDetails, // Export refresh function
  };
}
