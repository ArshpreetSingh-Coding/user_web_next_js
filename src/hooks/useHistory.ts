import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { RideHistoryItem, RideStatus } from "../components/history/HistoryCard";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRideHistoryItem } from "@/types";
import { fetchRideHistory } from "@/lib/api/history.api";
import { toast } from "sonner";

const TABS = ["All", "Scheduled", "Completed", "Cancelled"] as const;
export type TabType = typeof TABS[number];

// Map API response to UI model
export const mapApiRideToRideHistoryItem = (apiRide: ApiRideHistoryItem): RideHistoryItem => {
    let status: RideStatus = "Completed";
    const isScheduled = apiRide.is_upcoming_ride == 1 || apiRide.is_upcoming_ride === "1";

    // Mapping status based on common Jugnoo flags
    if (isScheduled) {
        status = "Scheduled";
    } else if (apiRide.is_cancelled_ride === 1 || apiRide.autos_status === 5) {
        status = "Cancelled";
    } else if (apiRide.autos_status === 1) {
        status = "Scheduled";
    } else if (apiRide.autos_status === 6) {
        status = "Completed";
    }

    const pickupAddr = apiRide.pickup_location_address || apiRide.pickup_address;
    const dropAddr = apiRide.drop_location_address || apiRide.drop_address;

    return {
        id: apiRide.pickup_id?.toString() ||
            apiRide.engagement_id?.toString() ||
            apiRide.schedule_pickup_id?.toString() ||
            Math.random().toString(),
        engagementId: apiRide.engagement_id?.toString(),
        location: dropAddr?.split(',')[0] || "Unknown",
        subLocation: apiRide.region_name || pickupAddr?.split(',')[0] || "Ride",
        price: Number(apiRide.customer_fare_estimate || apiRide.amount || 0),
        date: apiRide.pickup_time || apiRide.created_at,
        status: status,
        pickupLat: apiRide.latitude || apiRide.pickup_latitude || 0,
        pickupLng: apiRide.longitude || apiRide.pickup_longitude || 0,
        dropLat: apiRide.op_drop_latitude || apiRide.drop_latitude || 0,
        dropLng: apiRide.op_drop_longitude || apiRide.drop_longitude || 0,
        pickupAddress: pickupAddr || "",
        dropAddress: dropAddr || "",
        driverName: "Driver",
        distance: (apiRide.estimated_distance || apiRide.distance) ? `${apiRide.estimated_distance || apiRide.distance} ${apiRide.distance_unit || "km"}` : "0 km",
        duration: apiRide.ride_time ? `${apiRide.ride_time} min` : "0 min",
        paymentMethod: apiRide.preferred_payment_mode === 1 ? "Cash" : "Cash",
        historyIcon: apiRide.history_icon
    };
};

export function useHistory(errorMessage: string) {
    const { isAuthenticated } = useAuthStore();

    const [rides, setRides] = useState<RideHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("All");
    const [selectedRide, setSelectedRide] = useState<RideHistoryItem | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Filter rides based on active tab
    const filteredRides = useMemo(() => {
        return rides.filter((ride) => {
            if (activeTab === "All") return true;
            return ride.status === activeTab;
        });
    }, [rides, activeTab]);

    // Fetch ride history
    useEffect(() => {
        const controller = new AbortController();

        const loadHistory = async () => {
            if (!isAuthenticated) return;

            try {
                setIsLoading(true);
                const response = await fetchRideHistory({
                    start_from: "0",
                    show_custom_fields: 1,
                    login_type: "0",
                    locale: "en"
                }, controller.signal);

                if (response.data && Array.isArray(response.data)) {
                    const mappedRides = response.data.map(mapApiRideToRideHistoryItem);
                    setRides(mappedRides);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled");
                } else {
                    console.error("History fetch error:", error);
                    toast.error(errorMessage);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            controller.abort();
        };
    }, [isAuthenticated, errorMessage]);

    // Handle card click
    const handleCardClick = (ride: RideHistoryItem) => {
        if (ride.status === "Completed") {
            setSelectedRide(ride);
            setDetailsOpen(true);
        }
    };

    return {
        rides,
        isLoading,
        activeTab,
        setActiveTab,
        selectedRide,
        detailsOpen,
        setDetailsOpen,
        filteredRides,
        handleCardClick,
        TABS
    };
}
