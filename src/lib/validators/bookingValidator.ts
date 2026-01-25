import type { Location } from "@/types";
import type { Stop } from "@/components/booking/types";

export interface BookingFormData {
  pickup: Location | null;
  destination: Location | null;
  stops: Stop[];
  scheduledDateTime: Date | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const bookingValidator = {
  /**
   * Validate pickup location
   */
  validatePickup(pickup: Location | null): ValidationResult {
    if (!pickup?.lat || !pickup?.lng || !pickup?.address) {
      return {
        isValid: false,
        error: "Please select a valid pickup location",
      };
    }
    return { isValid: true };
  },

  /**
   * Validate destination location
   */
  validateDestination(destination: Location | null): ValidationResult {
    if (!destination?.lat || !destination?.lng || !destination?.address) {
      return {
        isValid: false,
        error: "Please select a valid destination",
      };
    }
    return { isValid: true };
  },

  /**
   * Validate all stops
   */
  validateStops(stops: Stop[]): ValidationResult {
    for (let i = 0; i < stops.length; i++) {
      if (!stops[i].latitude || !stops[i].longitude || !stops[i].chosen_address) {
        return {
          isValid: false,
          error: `Please select a valid location for stop ${i + 1}`,
        };
      }
    }
    return { isValid: true };
  },

  /**
   * Validate scheduled date time (optional - only validate if provided)
   */
  validateScheduledDateTime(scheduledDateTime: Date | null): ValidationResult {
    // Scheduled time is optional - if not provided, it's an immediate ride
    if (!scheduledDateTime) {
      return { isValid: true };
    }

    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 15 * 60 * 1000); // Current time + 15 minutes

    if (scheduledDateTime < minAllowedTime) {
      return {
        isValid: false,
        error: "Schedule time must be at least 15 minutes from now",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate entire booking form
   */
  validateBookingForm(data: BookingFormData): ValidationResult {
    // Validate pickup
    const pickupValidation = this.validatePickup(data.pickup);
    if (!pickupValidation.isValid) {
      return pickupValidation;
    }

    // Validate destination
    const destinationValidation = this.validateDestination(data.destination);
    if (!destinationValidation.isValid) {
      return destinationValidation;
    }

    // Validate stops
    const stopsValidation = this.validateStops(data.stops);
    if (!stopsValidation.isValid) {
      return stopsValidation;
    }

    // Validate scheduled time
    const scheduleValidation = this.validateScheduledDateTime(data.scheduledDateTime);
    if (!scheduleValidation.isValid) {
      return scheduleValidation;
    }

    return { isValid: true };
  },
};
