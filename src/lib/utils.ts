import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_ENDPOINTS } from "./api/endpoints";
import { DefaultResponse } from "@/types";
import apiClient from "./api/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateHmacHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_ENDPOINTS.PRODUCTION.BUSINESS_TOKEN);
  const dataBuffer = encoder.encode(data);

  try {
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);

    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('HMAC generation failed:', error);
    throw new Error('Failed to generate HMAC hash');
  }
}

export async function fetchOperatorParams(sessionDetails: any): Promise<DefaultResponse> {
  try {
    var reqObj = {
      param_names: ['map_browser_key', 'autos_panel_theme']
    }

    const headers = {
      'x-jugnoo-session-id': sessionDetails.session_id,
      'x-jugnoo-session-identifier': sessionDetails.session_identifier,
    }
    let response;
    console.log("headers fetchOperatorParams", headers);
    try {
      response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.FETCH_OPERATOR_PARAMS, reqObj, {
        headers,
        timeout: 5000,
      });
    }
    catch (error) {
      console.log("error fetchOperatorParams", error);
    }
    console.log("response fetchOperatorParams", response?.data.data.autos_panel_theme);
    
    
    // console.log('Fetch operator params response:', response.data);
    if (response?.status === 200) {
      return {
        success: true,
        message: 'Fetched operator params',
        data: response?.data.data,
      };
    }

    return {
      success: false,
      message: 'Fetch operator params returned unexpected status',
    };

  } catch (error: any) {
    console.error('❌ Fetch operator params failed:', error.message);
    const errorMsg = error.message || 'Fetch operator params failed';
    return {
      success: false,
      message: errorMsg,
    };
  }
}