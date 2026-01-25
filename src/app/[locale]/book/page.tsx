"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import RideBookingForm from "@/components/booking/RideBookingForm";
import ActionButton from "@/components/shared/ActionButton";
import HeaderActions from "@/components/shared/HeaderActions";
import { CheckBox, SubRegionCard } from "@/components/SubRegionCard";
import {
  TitleBlock,
  DescriptionBlock,
  PriceBlock,
} from "@/components/SubRegionCard";
import { SelectedItems } from "@/components/SubRegionCard/SelectedItems";
import { Card } from "@/components/ui/card";
import { useBookingStore } from "@/stores/booking.store";
import { useAuthStore } from "@/stores/auth.store";
import Stepper from "@/components/Stepper";
import CouponPaymentCard from "@/components/CouponPaymentCard";
import IncrementDecrement from "@/components/IncrementDecrement";
import { useRouter, useParams } from "next/navigation";
import type { VehicleRegion } from "@/types";
import { getCouponsPromos, type Coupon } from "@/lib/api/coupons";
import { toast } from 'sonner';

const steps = [
  { label: "Select Car Type" },
  { label: "Choose Service" },
  { label: "Payment" },
];

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const {
    availableVehicles,
    selectedRegion,
    setSelectedRegion,
    currentStepIndex,
    setCurrentStepIndex,
    selectedServices,
    setSelectedServices,
    appliedCoupon,
    setAppliedCoupon,
    passengerCount,
    setPassengerCount,
    luggageCount,
    setLuggageCount,
    driverNote,
    setDriverNote,
  } = useBookingStore();

  // Use available vehicles from store - no fallbacks
  const regions = availableVehicles;
  const [vehicleServices, setVehicleServices] = useState<{ id: number; name: string; price: number; eta: number; description: string }[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isMobileFormActive, setIsMobileFormActive] = useState(true);

  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const fetchedCoupons = await getCouponsPromos();
        setCoupons(fetchedCoupons);
      } catch (error) {
        console.log('Error fetching coupons:', error);
        setCoupons([]);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, []);

  const selectedAdditionalServices = useMemo(() => {
    return vehicleServices
      .filter((svc) => selectedServices.includes(svc.id))
      .map((svc) => ({ id: svc.id, name: svc.name, price: svc.price }));
  }, [selectedServices, vehicleServices]);

  const subProgress = useMemo(() => {
    if (currentStepIndex === 0) {
      // Step 1: Show progress when vehicle is selected
      return selectedRegion ? 150 : 0;
    }
    if (currentStepIndex === 1) {
      // Step 2: Calculate progress based on optional selections
      return 90;
    }
    return 0;
  }, [currentStepIndex, selectedRegion, selectedServices, appliedCoupon, luggageCount, driverNote]);
  console.log('SubProgress:', subProgress);
  
  // Target view for the right panel list
  const targetView = useMemo<"regions" | "services">(() => {
    return currentStepIndex === 0 ? "regions" : "services";
  }, [currentStepIndex]);

  // Simple fade swap (opacity only)
  const [renderView, setRenderView] = useState<"regions" | "services">(
    targetView
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (renderView === targetView) return;

    setVisible(false);
    const t = window.setTimeout(() => {
      setRenderView(targetView);
      // next paint => fade in
      requestAnimationFrame(() => setVisible(true));
    }, 140);

    return () => window.clearTimeout(t);
  }, [targetView, renderView]);

  const handleRegionSelect = (regionId: number) => {
    const region = regions.find((r) => r.region_id === regionId);
    if (region) {
      setSelectedRegion(region);
      const servicesWithEta = (region.vehicle_services || []).map((svc) => ({
        ...svc,
        id: svc.id ?? 0,
        name: svc.name ?? '',
        price: svc.price ?? 0,
        eta: svc.eta ?? 0,
        description: svc.description ?? '',
      }));
      console.log('SelectedRegion:', selectedRegion);
      setVehicleServices(servicesWithEta);
      setSelectedServices([]);
    }
  };

  const toggleService = (serviceId: number) => {
    const updatedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(updatedServices);
  };

  const handleCouponApply = (couponId: number | null) => {
    if (couponId === appliedCoupon) {
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(couponId);
  }



  const { isAuthenticated } = useAuthStore();

  const handleStepChange = useCallback((nextStep: number) => {
    if (nextStep >= 1 && !selectedRegion) {
      return;
    }

    // Prevent unauthenticated users from proceeding past step 0
    if (nextStep > 0 && !isAuthenticated) {
      toast.error('Please login to continue');
      return;
    }

    if (nextStep === 2) {
      router.push(`/${locale}/ride-summary`);
      return;
    }

    setCurrentStepIndex(nextStep);
  }, [selectedRegion, locale, router, setCurrentStepIndex, isAuthenticated]);

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && currentStepIndex === 0 && !isMobileFormActive) {
      setIsMobileFormActive(true);
      return;
    }

    if (currentStepIndex === 0) {
      router.push(`/${locale}/home`);
      return;
    }

    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setCurrentStepIndex, isMobileFormActive, locale, router]);
  
  const onNext = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && currentStepIndex === 0 && isMobileFormActive) {
      setIsMobileFormActive(false);
      return;
    }

    if (currentStepIndex === 0) {
      // Check authentication before proceeding to step 1
      if (!isAuthenticated) {
        toast.error('Please login to continue');
        return;
      }

      if (!selectedRegion) {
        toast.error('Please select a vehicle to proceed');
        return;
      }
      setCurrentStepIndex(1);
    } else if (currentStepIndex === 1) {
      router.push(`/${locale}/ride-summary`);
    }
  }, [currentStepIndex, selectedRegion, locale, router, setCurrentStepIndex, isMobileFormActive, isAuthenticated]);

  return (
    <section className="relative min-h-[calc(100vh-88px)] pb-20 w-full bg-[#f8f8f8]">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <HeaderActions onBack={onBack} onNext={onNext} />

        <div className="w-full grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] md:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10 items-start">
          <div className={`${isMobileFormActive && currentStepIndex === 0 ? "block" : "hidden"} md:block w-full lg:min-w-105 lg:max-w-110 md:max-w-70 lg:sticky lg:top-6 space-y-4`}>
            <RideBookingForm className="mx-0! min-w-full" variant="outline" />
            {selectedRegion && <h2 className="H1">Selected Items</h2>}

            {selectedRegion && (
              <SelectedItems
                imgSrc={selectedRegion.images.tab_normal}
                additionalServices={selectedAdditionalServices}
                titleComponent={
                  <TitleBlock
                    title={selectedRegion.region_name}
                    capacity={selectedRegion.max_people}
                    minutes={selectedRegion.eta || undefined}
                  />
                }
                priceComponent={
                  <PriceBlock
                    currencySymbol={selectedRegion.region_fare?.currency_symbol || "₹"}
                    price={selectedRegion.region_fare?.fare_float}
                    oldPrice={
                      selectedRegion.region_fare?.original_fare_float !==
                        selectedRegion.region_fare?.fare_float
                        ? selectedRegion.region_fare?.original_fare_float
                        : undefined
                    }
                  />
                }
              />
            )}
          </div>

          <div className={`w-full ${isMobileFormActive && currentStepIndex === 0 ? "hidden md:block" : "block"}`}>
            <Card className="items-center mb-6 max-sm:-px-1">
              <Stepper
                steps={steps}
                currentStep={currentStepIndex}
                subProgress={subProgress}
                onStepChange={handleStepChange}
              />
            </Card>

            <Card className="px-6 max-sm:border-none max-sm:shadow-none max-sm:px-1">
              <div className="flex justify-between items-center">
                <h2 className="H2">
                  {targetView === "regions"
                    ? "Choose a ride"
                    : "Choose a service"}
                </h2>
                {currentStepIndex === 0 && (
                  <IncrementDecrement
                    title="Passengers"
                    value={passengerCount}
                    onIncrement={() => setPassengerCount(passengerCount + 1)}
                    onDecrement={() =>
                      setPassengerCount(Math.max(1, passengerCount - 1))
                    }
                  />
                )}
              </div>

              <div
                className={`overflow-y-auto max-h-150 space-y-3
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1
                  transition-opacity duration-200 ease-in-out will-change-[opacity] max-sm:max-h-full ${visible ? "opacity-100" : "opacity-0"
                  }`}
              >
                {currentStepIndex === 0 ? (
                  regions.length > 0 ? (
                    regions.map((region) => (
                      <SubRegionCard
                        key={region.region_id}
                        imgSrc={region.images.tab_normal}
                        selected={selectedRegion?.region_id === region.region_id}
                        onClick={() => handleRegionSelect(region.region_id)}
                        className="max-h-25"
                        subComponent1={
                          <TitleBlock
                            title={region.region_name}
                            capacity={region.max_people}
                            minutes={region.eta || undefined}
                          />
                        }
                        subComponent2={
                          <PriceBlock
                            currencySymbol={region.region_fare?.currency_symbol || "₹"}
                            price={region.region_fare?.fare_float}
                            oldPrice={
                              region.region_fare?.original_fare_float !==
                                region.region_fare?.fare_float
                                ? region.region_fare?.original_fare_float
                                : undefined
                            }
                          />
                        }
                        subComponent3={
                          <DescriptionBlock
                            text={
                              region.description ||
                              region.disclaimer_text ||
                              `Book a ${region.region_name} for your ride`
                            }
                          />
                        }
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-muted-foreground mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles available</h3>
                      <p className="text-sm text-muted-foreground">Please enter pickup and destination to find available rides</p>
                    </div>
                  )
                ) : (
                  <>
                    {!selectedRegion ? (
                      <div className="text-sm text-muted-foreground py-4">
                        Please select a ride first.
                      </div>
                    ) : (
                      <div
                        className={`overflow-y-auto max-h-90 space-y-3
                          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1
                          transition-opacity duration-200 ease-in-out will-change-[opacity] max-sm:max-h-full ${visible ? "opacity-100" : "opacity-0"
                          }`}
                      >
                        {vehicleServices.length > 0 ? (
                          vehicleServices.map((svc) => (
                            <SubRegionCard
                              key={svc.id}
                              imgSrc="/default.png"
                              onClick={() => toggleService(svc.id)}
                              className="max-h-22"
                              subComponent1={
                                <TitleBlock title={svc.name} minutes={svc.eta} />
                              }
                              subComponent2={
                                <CheckBox
                                  checked={selectedServices.includes(svc.id)}
                                  onCheckedChange={() => toggleService(svc.id)}
                                />
                              }
                              subComponent3={
                                <DescriptionBlock text={svc.description} />
                              }
                              subComponent4={
                                <PriceBlock price={svc.price} currencySymbol={selectedRegion.region_fare?.currency_symbol || "₹"} />
                              }
                            />
                          ))
                        ) : (
                          <Card>
                            <div className="text-center py-2 text-muted-foreground">
                              <p>No additional services available for this vehicle</p>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {currentStepIndex === 1 && (
              <>
                <Card className="px-6 mt-6 max-sm:border-none max-sm:shadow-none max-sm:px-1">
                  <h2 className="H2">Coupons & Promotions</h2>

                  <div
                    className={`overflow-y-auto max-h-90 space-y-3
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1
                  transition-opacity duration-200 ease-in-out will-change-[opacity] max-sm:max-h-full ${visible ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    {isLoadingCoupons ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Loading coupons...</p>
                      </div>
                    ) : coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <CouponPaymentCard
                          key={coupon.id}
                          imgUrl="/offer.png"
                          title={coupon.code}
                          subtitle={coupon.description}
                          onClick={() => handleCouponApply(coupon.id)}
                          selected={appliedCoupon === coupon.id}
                        />
                      ))
                    ) : (
                      <Card>
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No coupons available at the moment</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>

                <Card className="px-6 mt-6 max-sm:px-2">
                  <div className="flex justify-between items-center">
                    <h2 className="H2 max-sm:text-lg!">Add Luggage</h2>
                    <IncrementDecrement
                      value={luggageCount}
                      onIncrement={() => setLuggageCount(luggageCount + 1)}
                      onDecrement={() =>
                        setLuggageCount(Math.max(0, luggageCount - 1))
                      }
                    />
                  </div>
                </Card>

                <Card className="px-6 mt-6 max-sm:px-2">
                  <div className="flex justify-between items-center">
                    <h2 className="H2 max-sm:text-lg! max-sm:-mb-2">Note For Driver</h2>
                  </div>
                  <textarea
                    value={driverNote}
                    onChange={(e) => setDriverNote(e.target.value)}
                    placeholder="Write here"
                    className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring focus:ring-border max-sm:h-24"
                    rows={5}
                    maxLength={500}
                  />
                </Card>
              </>
            )}


            {(currentStepIndex >= 1 && selectedRegion) && (
              <div className="md:hidden">
                {selectedRegion && <h2 className="H1 my-4 max-sm:text-xl!">Selected Items</h2>}
                <SelectedItems
                  imgSrc={selectedRegion.images.tab_normal}
                  additionalServices={selectedAdditionalServices}
                  titleComponent={
                    <TitleBlock
                      title={selectedRegion.region_name}
                      capacity={selectedRegion.max_people}
                      minutes={selectedRegion.eta || undefined}
                    />
                  }
                  priceComponent={
                    <PriceBlock
                      currencySymbol={selectedRegion.region_fare?.currency_symbol || "₹"}
                      price={selectedRegion.region_fare?.fare_float}
                      oldPrice={
                        selectedRegion.region_fare?.original_fare_float !==
                          selectedRegion.region_fare?.fare_float
                          ? selectedRegion.region_fare?.original_fare_float
                          : undefined
                      }
                    />
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 w-full py-3 px-4 block sm:hidden bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <ActionButton onClick={onNext} className="w-[90%] px-2 text-lg justify-center mx-auto flex h-9.50!">
          {"Next"}
        </ActionButton>
      </div>
    </section>
  );
}
