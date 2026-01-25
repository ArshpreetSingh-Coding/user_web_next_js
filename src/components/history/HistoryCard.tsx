import Image from "next/image";
import { format } from "date-fns";

export type RideStatus = "Completed" | "Cancelled" | "Scheduled";

export interface RideHistoryItem {
    id: number | string;
    engagementId?: string;
    location: string;
    subLocation: string;
    price: number;
    date: string; // ISO string
    status: RideStatus;
    // Extended details for Trip Dialog
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    pickupAddress: string;
    dropAddress: string;
    driverName: string;
    distance: string;
    duration: string;
    paymentMethod: string;
    historyIcon?: string;
}

interface HistoryCardProps {
    ride: RideHistoryItem;
    onClick?: (ride: RideHistoryItem) => void;
}

export function HistoryCard({ ride, onClick }: HistoryCardProps) {
    const getStatusColor = (status: RideStatus) => {
        switch (status) {
            case "Completed":
                return "bg-[#ECFDF3] text-[#027A48]"; // Success Green
            case "Cancelled":
                return "bg-[#FEF3F2] text-[#B42318]"; // Error Red
            case "Scheduled":
                return "bg-[#FFFAEB] text-[#B54708]"; // Warning Yellow/Orange
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const isCompleted = ride.status === "Completed";

    return (
        <div
            onClick={() => isCompleted && onClick?.(ride)}
            className={`bg-white rounded-xl shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] border border-gray-100 p-4 flex items-center gap-4 ${isCompleted ? "hover:shadow-md transition-shadow cursor-pointer" : ""
                }`}
        >
            {/* Car Image */}
            <div className="shrink-0 bg-gray-50 rounded-lg p-2 w-20 h-20 flex items-center justify-center relative overflow-hidden">
                <Image
                    src={ride.historyIcon || "/images/vehicles/mainCar.png"}
                    alt="Vehicle"
                    fill
                    className="object-contain"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 wrap-break-word text-sm sm:text-base leading-tight">
                            {ride.location}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium wrap-break-word">
                            ({ride.subLocation})
                        </p>
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap text-sm sm:text-base shrink-0">
                        ₹{ride.price.toFixed(2)}
                    </span>
                </div>

                <div className="mt-3 flex justify-between items-end">
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        {format(new Date(ride.date), "MMM dd (h:mm a)")}
                    </p>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(ride.status)}`}>
                        {ride.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
