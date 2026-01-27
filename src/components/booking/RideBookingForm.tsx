"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PickupLocationField from "./PickupLocationField";
import DestinationField from "./DestinationField";
import ScheduleField from "./ScheduleField";
import ServiceSelector from "./ServiceSelector";
import AddStopButton from "./AddStopButton";
import StopItem from "./StopItem";
import { useBookingForm } from "./useBookingForm";
import { bookingValidator } from "@/lib/validators/bookingValidator";

import { useBookingStore } from "@/stores/booking.store";
import { useUIStore } from "@/stores/ui.store";
import { useFindADrivers } from "@/hooks/useFindADrivers";

const RideBookingForm = ({ className, variant }: { className?: string; variant?: "outline" | "filled" }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const pathname = usePathname() || "";

  const {
    setSelectedRegion,
    setSelectedServices,
    setAvailableVehicles,
    selectedService
  } = useBookingStore();
  const { showToast } = useUIStore();
  const { isFinding, calculateFareAndFindDrivers } = useFindADrivers();

  const {
    pickup,
    setPickup,
    destination,
    setDestination,
    stops,
    scheduledDateTime,
    setScheduledDateTime,
    addStop,
    removeStop,
    updateStop,
  } = useBookingForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Book Now button click
  const handleBookNow = useCallback(async () => {
    setSelectedRegion(null);
    setSelectedServices([]);
    setAvailableVehicles([]);

    const validation = bookingValidator.validateBookingForm({
      pickup,
      destination,
      stops,
      scheduledDateTime,
    });

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const result = await calculateFareAndFindDrivers();
      console.log("🚙 Vehicles ready:", result.vehicles.length);

      const locale = params?.locale || "en";
      router.push(`/${locale}/book`);
    } catch (err) {
      // console.error("❌ Error in handleBookNow:", err);
      showToast("Failed to get quotes. Please try again.", "error");
    }
  }, [
    calculateFareAndFindDrivers,
    destination,
    params?.locale,
    pickup,
    router,
    scheduledDateTime,
    setSelectedRegion,
    setSelectedServices,
    showToast,
    stops,
  ]);

  const handleCalculateFare = useCallback(async () => {
    setSelectedRegion(null);
    setSelectedServices([]);
    setAvailableVehicles([]);

    const validation = bookingValidator.validateBookingForm({
      pickup,
      destination,
      stops,
      scheduledDateTime,
    });

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      const result = await calculateFareAndFindDrivers();
      toast.success(
        `Found ${result.vehicles.length} vehicles. Route: ${result.route.distanceText}, ${result.route.durationText}`
      );
    } catch (err) {
      // console.error("❌ Error calculating fare:", err);
      toast.error("Failed to calculate fare. Please try again.");
    }
  }, [
    calculateFareAndFindDrivers,
    destination,
    pickup,
    scheduledDateTime,
    setSelectedRegion,
    setSelectedServices,
    stops,
  ]);

  // Auto-calculate fare when service changes and we are on the book page
  useEffect(() => {
    if (pathname.includes("/book") && selectedService && pickup?.address && destination?.address) {
      handleCalculateFare();
    }
  }, [selectedService, pickup?.address, destination?.address, handleCalculateFare, pathname]);

  const isBookPage = pathname.includes("/book");
  const handleSubmit = isBookPage ? handleCalculateFare : handleBookNow;
  // console.log("selectedService", selectedService?.type)
  return (
    <div
      className={`w-full max-w-[420px] p-4 lg:p-6 bg-primary rounded-lg lg:rounded-xl flex flex-col ${!isBookPage ? "lg:max-h-125" : ""} ${className}  ${variant === "outline" ? "bg-white border border-border" : ""}`}
    >
      <h2
        className={`text-base lg:text-xl font-semibold text-white mb-3 lg:mb-5 shrink-0 ${variant === "outline" ? "text-black!" : ""}`}
      >
        Where do you want to Go?
      </h2>

      <div className={`flex flex-col flex-1 ${!isBookPage ? "overflow-y-auto" : ""} lg:pr-3 space-y-1 lg:space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/30`}>
        <PickupLocationField value={pickup} onChange={setPickup} variant={variant} />

        {mounted && (
          <AnimatePresence>
            {stops.map((stop, index) => (
              <StopItem
                key={stop.id}
                stop={stop}
                index={index}
                onUpdate={updateStop}
                onRemove={removeStop}
                variant={variant}
              />
            ))}
          </AnimatePresence>
        )}

        {stops.length < 3 && <AddStopButton onClick={addStop} mounted={mounted} variant={variant} />}

        <DestinationField value={destination} onChange={setDestination} variant={variant} />

        <ScheduleField value={scheduledDateTime} onChange={setScheduledDateTime} variant={variant} />

        <ServiceSelector variant={variant} />
      </div>

      <motion.div
        className="mt-4 lg:mt-5 shrink-0"
        whileHover={mounted ? { scale: 1.02 } : undefined}
        whileTap={mounted ? { scale: 0.98 } : undefined}
      >
        <Button
          onClick={handleSubmit}
          disabled={isFinding || !pickup?.address || !destination?.address}
          variant="outline"
          className={`w-full h-10 lg:h-11 bg-white text-primary hover:bg-white hover:scale-102 hover:text-primary font-semibold text-sm lg:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${variant === "outline" ? "bg-primary text-white! hover:text-primary!" : ""}`}
        >
          {isFinding ? "Loading..." : isBookPage ? "Calculate Fare" : "Book Now"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default RideBookingForm;
