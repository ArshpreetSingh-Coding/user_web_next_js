import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
    FetchWalletBalanceRequest,
    FetchWalletBalanceResponse,
    GetTransactionHistoryRequest,
    GetTransactionHistoryResponse
} from '@/types';

/**
 * Fetch Wallet Balance
 */
export const fetchWalletBalance = async (data: FetchWalletBalanceRequest): Promise<FetchWalletBalanceResponse> => {
    console.log('💰 Calling fetch_wallet_balance API', data);

    try {
        const response = await apiClient.post<FetchWalletBalanceResponse>(
            API_ENDPOINTS.WALLET.FETCH_WALLET_BALANCE,
            data
        );

        console.log('✅ Wallet Balance API Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Wallet Balance API Error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get Transaction History
 */
export const getTransactionHistory = async (data: GetTransactionHistoryRequest): Promise<GetTransactionHistoryResponse> => {
    console.log('📜 Calling get_transaction_history API', data);

    try {
        const response = await apiClient.post<GetTransactionHistoryResponse>(
            API_ENDPOINTS.WALLET.GET_TRANSACTION_HISTORY,
            data
        );

        console.log('✅ Transaction History API Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Transaction History API Error:', error.response?.data || error.message);
        throw error;
    }
};
