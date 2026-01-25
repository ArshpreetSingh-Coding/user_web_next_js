"use client";

import { useCallback, useState } from "react";
import { insertPickupSchedule } from "@/lib/ride-booking/findDriver";
import { useAuthStore } from "@/stores/auth.store";
import { useBookingStore } from "@/stores/booking.store";
import type { InsertPickupScheduleRequest, InsertPickupScheduleResponse } from "@/types";

/**
 * Creates a pickup schedule booking using current booking + session state.
 */
export function useInsertPickupSchedule() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sessionId, sessionIdentifier } = useAuthStore();
  const {
    selectedRegion,
    selectedService,
    pickup,
    dropoff,
    passengerCount,
    luggageCount,
    driverNote,
    selectedPaymentMethod,
    selectedCardId,
    selectedSquareCardId,
    scheduledDateTime,
  } = useBookingStore();

  const submitPickupSchedule = useCallback(async (): Promise<InsertPickupScheduleResponse> => {
    if (!sessionId || !sessionIdentifier) {
      throw new Error("Missing session details");
    }

    if (!selectedRegion) {
      throw new Error("No region selected");
    }

    if (!selectedService?.id) {
      throw new Error("No service selected");
    }

    if (!pickup?.lat || !pickup?.lng || !pickup?.address) {
      throw new Error("Pickup location is incomplete");
    }

    if (!dropoff?.lat || !dropoff?.lng || !dropoff?.address) {
      throw new Error("Dropoff location is incomplete");
    }

    const payload: InsertPickupScheduleRequest = {
      sessionId,
      sessionIdentifier,
      regionId: selectedRegion.region_id,
      serviceId: Number(selectedService.id),
      vehicleType: selectedRegion.vehicle_type,
      latitude: pickup.lat,
      longitude: pickup.lng,
      pickupLocationAddress: pickup.address,
      pickupTime: scheduledDateTime ?? new Date(),
      dropLatitude: dropoff.lat,
      dropLongitude: dropoff.lng,
      dropLocationAddress: dropoff.address,
      passengerCount: passengerCount,
      luggageCount: luggageCount,
      customerNote: driverNote || undefined,
      preferredPaymentMode: 
        selectedPaymentMethod === "cash" ? 1 : 
        selectedPaymentMethod === "stripe_card" ? 9 : 
        selectedPaymentMethod === "square_card" ? 73 : 1, // Default to cash if unknown
      cardId: selectedPaymentMethod === "stripe_card" ? selectedCardId : 
              selectedPaymentMethod === "square_card" ? selectedSquareCardId : undefined,
    };

    setIsSubmitting(true);
    try {
      return await insertPickupSchedule(payload);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    dropoff,
    driverNote,
    luggageCount,
    passengerCount,
    pickup,
    scheduledDateTime,
    selectedPaymentMethod,
    selectedCardId,
    selectedSquareCardId,
    selectedRegion,
    selectedService?.id,
    sessionId,
    sessionIdentifier,
  ]);

  return {
    isSubmitting,
    submitPickupSchedule,
  };
}
