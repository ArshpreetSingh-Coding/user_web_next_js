"use client";

import { HistoryCard } from "./HistoryCard";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { TripDetailsDialog } from "./TripDetailsDialog";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";
import { useHistory } from "../../hooks/useHistory";
import { useSessionGuard } from "@/hooks/useSessionGuard";

export function HistoryPageContent() {
    // Session guard - validates session if user is authenticated
    const { isAuthenticated } = useAuthStore();
    useSessionGuard({ 
        redirectTo: '/en/home',
        validateInterval: 5 * 60 * 1000, // Validate every 5 minutes
        skipInitialValidation: !isAuthenticated // Only validate if authenticated
    });

    const { t } = useTranslations();

    const {
        isLoading,
        activeTab,
        setActiveTab,
        selectedRide,
        detailsOpen,
        setDetailsOpen,
        filteredRides,
        handleCardClick,
        TABS
    } = useHistory(t("Failed to load ride history"));

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-gray-50 p-8 rounded-2xl border border-dashed flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{t("Access Protected")}</h2>
                        <p className="text-gray-500">{t("Please login to view your ride history and manage your trips.")}</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-login'))}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            {t("Login Now")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6 md:gap-8 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-800">{t("History")}</h1>

                    {/* Tabs/Pills */}
                    <div className="flex bg-transparent gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {t(tab)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dropdown */}
                {/* <div className="w-full md:w-auto">
                    <Select value={rideType} onValueChange={setRideType}>
                        <SelectTrigger className="w-[140px] bg-gray-100 border-none rounded-2xl font-medium text-gray-700 focus:bg-white transition-colors">
                            <SelectValue placeholder={t("Daily")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">{t("Daily")}</SelectItem>
                            <SelectItem value="rental">{t("Rental")}</SelectItem>
                            <SelectItem value="outstation">{t("Outstation")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div> */}
            </div>

            {/* Grid Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-gray-500 font-medium">{t("Loading your rides...")}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredRides.map((ride) => (
                            <HistoryCard
                                key={ride.id}
                                ride={ride}
                                onClick={handleCardClick}
                            />
                        ))}
                    </div>

                    {filteredRides.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed text-gray-400">
                            {t("No rides found")}
                        </div>
                    )}
                </>
            )}

            <TripDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                ride={selectedRide}
            />
        </div>
    );
}
