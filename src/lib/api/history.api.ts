import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { HistoryRequest, HistoryResponse, RideSummaryRequest, RideSummaryResponse } from '@/types';

export const fetchRideHistory = async (request: HistoryRequest, signal?: AbortSignal): Promise<HistoryResponse> => {
    const { data } = await apiClient.post<HistoryResponse>(
        API_ENDPOINTS.HISTORY.RIDES,
        request,
        { signal }
    );
    return data;
};

export const fetchRideSummary = async (request: RideSummaryRequest, signal?: AbortSignal): Promise<RideSummaryResponse> => {
    const { data } = await apiClient.post<RideSummaryResponse>(
        API_ENDPOINTS.HISTORY.GET_RIDE_SUMMARY,
        request,
        { signal }
    );
    return data;
};
