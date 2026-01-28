"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PickupLocationField from "./PickupLocationField";
import DestinationField from "./DestinationField";
import ScheduleField from "./ScheduleField";
import ServiceSelector from "./ServiceSelector";
import AddStopButton from "./AddStopButton";
import StopItem from "./StopItem";
import { useBookingForm } from "./useBookingForm";
import { bookingValidator } from "@/lib/validators/bookingValidator";
import IncrementDecrement from "@/components/IncrementDecrement";
import {PhoneInput} from "@/components/auth/phoneInput";

import { useBookingStore } from "@/stores/booking.store";
import { useUIStore } from "@/stores/ui.store";
import { useFindADrivers } from "@/hooks/useFindADrivers";

const RideBookingForm = ({ className, variant }: { className?: string; variant?: "outline" | "filled" }) => {
  const [mounted, setMounted] = useState(false);
  const [isBookForOtherOpen, setIsBookForOtherOpen] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const pathname = usePathname() || "";

  const {
    setSelectedRegion,
    setSelectedServices,
    setAvailableVehicles,
    selectedService,
    selectedRegion,
    setCurrentStepIndex,
    luggageCount,
    setLuggageCount,
    driverNote,
    setDriverNote,
    flightNumber,
    setFlightNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerCountryCode,
    setCustomerCountryCode,
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
    setCurrentStepIndex(0);

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
    setCurrentStepIndex,
  ]);

  // Auto-calculate fare when service changes and we are on the book page
  useEffect(() => {
    if (pathname.includes("/book") && selectedService && pickup?.address && destination?.address) {
      handleCalculateFare();
    }
  }, [selectedService, pickup?.address, destination?.address, handleCalculateFare, pathname]);

  const isBookPage = pathname.includes("/book");
  const handleSubmit = isBookPage ? handleCalculateFare : handleBookNow;
  const showAdditionalOptions = showOtherOptions;
  
  // console.log("selectedService", selectedService?.type)
  return (
    <div
      className={`w-full max-w-105 p-4 lg:p-6 bg-primary rounded-lg lg:rounded-xl flex flex-col ${!isBookPage ? "lg:max-h-125" : ""} ${className}  ${variant === "outline" ? "bg-white border border-border" : ""}`}
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

        {/* Other Options Toggle Button */}
        {isBookPage && (
          <Button
            type="button"
            onClick={() => setShowOtherOptions(!showOtherOptions)}
            variant="ghost"
            className={`w-full justify-between h-auto p-3 ${variant === "outline" ? "text-gray-700 hover:bg-gray-50" : "text-white hover:bg-white/10"}`}
          >
            <span className="font-medium">Other Options</span>
            {showOtherOptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Additional Options - shown when Other Options is toggled */}
        {showAdditionalOptions && (
          <div className="space-y-3 pt-2">
            {/* Book for someone else */}
            <Card className={`overflow-hidden ${variant === "outline" ? "border-gray-200" : "bg-white/10 border-white/20"}`}>
              <div
                className={`p-4 flex justify-between items-center cursor-pointer ${variant === "outline" ? "hover:bg-gray-50" : "hover:bg-white/5"}`}
                onClick={() => setIsBookForOtherOpen(!isBookForOtherOpen)}
              >
                <h3 className={`text-sm font-semibold ${variant === "outline" ? "text-gray-900" : "text-white"}`}>
                  Book for someone else
                </h3>
                {isBookForOtherOpen ? (
                  <ChevronUp className={`h-4 w-4 ${variant === "outline" ? "text-gray-600" : "text-white"}`} />
                ) : (
                  <ChevronDown className={`h-4 w-4 ${variant === "outline" ? "text-gray-600" : "text-white"}`} />
                )}
              </div>

              <AnimatePresence>
                {isBookForOtherOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <div className="space-y-1">
                        <label className={`text-xs font-medium ${variant === "outline" ? "text-gray-700" : "text-white/90"}`}>
                          Passenger Name
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter passenger name"
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring ${
                            variant === "outline" 
                              ? "border-gray-300 bg-white text-gray-900 focus:ring-primary/20" 
                              : "border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-white/20"
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className={`text-xs font-medium ${variant === "outline" ? "text-gray-700" : "text-white/90"}`}>
                          Passenger Phone
                        </label>
                        <PhoneInput
                          phoneNumber={customerPhone}
                          countryCode={customerCountryCode || 'US'}
                          onPhoneNumberChange={setCustomerPhone}
                          onCountryCodeChange={setCustomerCountryCode}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Flight Number - only for airport taxi */}
            {selectedService?.type === "airport_taxi" && (
              <Card className={`p-4 ${variant === "outline" ? "border-gray-200" : "bg-white/10 border-white/20"}`}>
                <label className={`text-sm font-semibold mb-2 block ${variant === "outline" ? "text-gray-900" : "text-white"}`}>
                  Flight Number
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g., AA123"
                  maxLength={20}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring ${
                    variant === "outline" 
                      ? "border-gray-300 bg-white text-gray-900 focus:ring-primary/20" 
                      : "border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-white/20"
                  }`}
                />
              </Card>
            )}

            {/* Luggage */}
            <Card className={`p-4 ${variant === "outline" ? "border-gray-200" : "bg-white/10 border-white/20"}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-sm font-semibold ${variant === "outline" ? "text-gray-900" : "text-white"}`}>
                  Add Luggage
                </h3>
                <IncrementDecrement
                  value={luggageCount}
                  onIncrement={() => setLuggageCount(luggageCount + 1)}
                  onDecrement={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                />
              </div>
            </Card>

            {/* Driver Note */}
            <Card className={`p-4 ${variant === "outline" ? "border-gray-200" : "bg-white/10 border-white/20"}`}>
              <label className={`text-sm font-semibold mb-2 block ${variant === "outline" ? "text-gray-900" : "text-white"}`}>
                Note For Driver
              </label>
              <textarea
                value={driverNote}
                onChange={(e) => setDriverNote(e.target.value)}
                placeholder="Write here..."
                maxLength={500}
                rows={3}
                className={`w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring ${
                  variant === "outline" 
                    ? "border-gray-300 bg-white text-gray-900 focus:ring-primary/20" 
                    : "border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-white/20"
                }`}
              />
            </Card>
          </div>
        )}
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
