import { BASE_URL } from "@/lib/api/endpoints";

/**
 * Non-3D Secure: Add card using Stripe token
 */

export async function addCardWithToken(
  tokenData: {
    stripe_token: string;
    card_id: string;
    last_4: string;
    exp_month: number;
    exp_year: number;
    brand: string;
  },
  sessionId: string,
  sessionIdentifier: string
): Promise<{
  flag: number;
  message: string;
  data?: any;
}> {
  const response = await fetch(`${BASE_URL}/open/v1/add_card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-jugnoo-session-id": sessionId,
      "x-jugnoo-session-identifier": sessionIdentifier,
    },
    body: JSON.stringify({
      stripe_token: tokenData.stripe_token,
      card_id: tokenData.card_id,
      last_4: tokenData.last_4,
      exp_month: tokenData.exp_month,
      exp_year: tokenData.exp_year,
      brand: tokenData.brand,
      payment_option: 9,
      is_delete: 0
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Step 1: Get secret key for adding a new card (3D Secure)
 * This calls /open/v1/add_card_3d to get a Stripe setup intent
 */
export async function getCardSecretKey(
  sessionId: string,
  sessionIdentifier: string
): Promise<{
  flag: number;
  message: string;
  data?: {
    client_secret: string;
    stripe_customer_id: string;
  }
}> {

  const response = await fetch(`${BASE_URL}/open/v1/add_card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-jugnoo-session-id": sessionId,
      "x-jugnoo-session-identifier": sessionIdentifier,
    },
    body: JSON.stringify({}), // Empty body as requested
  });

  const data = await response.json();
  return data;
}

/**
 * Step 2: Confirm card addition after Stripe 3D Secure verification
 * This calls /open/v1/confirm_card_3d to save the card
 */
export async function confirmCard3D(
  paymentMethodId: string,
  sessionId: string,
  sessionIdentifier: string
): Promise<{
  flag: number;
  message: string;
  data?: any;
}> {
  const response = await fetch(`${BASE_URL}/open/v1/confirm_card_3d`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-jugnoo-session-id": sessionId,
      "x-jugnoo-session-identifier": sessionIdentifier,
    },
    body: JSON.stringify({
      setup_intent_id: paymentMethodId,
    }),
  });

  const data = await response.json();
  return data;
}

/**
 * Delete a saved card
 */
export async function deleteCard(
  cardId: string | number,
  mode: string,
  sessionId: string,
  sessionIdentifier: string
): Promise<{ flag: number; message: string }> {
  const response = await fetch(`${BASE_URL}/open/v1/delete_card`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-jugnoo-session-id": sessionId,
      "x-jugnoo-session-identifier": sessionIdentifier,
    },
    body: JSON.stringify({
      id: cardId,
      mode: mode,
    }),
  });

  const data = await response.json();
  return data;
}
