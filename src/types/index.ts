/**
 * Application Types
 * All TypeScript interfaces and types for the application
 */

// ======================== API TYPES ========================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ======================== AUTH TYPES ========================

export interface User {
  user_id: string | number;
  name: string;
  email: string;
  phone_no: string;
  user_image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  agreedToTerms: boolean;
}

export interface GenerateOtpRequest {
  latitude: number;
  longitude: number;
  login_type: number;
  phone_no: string;
  country_code: string;
}

export interface GenerateOtpResponse {
  flag: number;
  message: string;
  data?: {
    session_id?: string;
    session_identifier?: string;
  };
}

export interface VerifyOtpRequest {
  latitude: number;
  longitude: number;
  login_type: number;
  phone_no: string;
  country_code: string;
  login_otp: string;
}

export interface VerifyOtpResponse {
  flag: number;
  message: string;
  error?: string;
  session_id?: string;
  session_identifier?: string;
  user_identifier?: string;
  access_token?: string;
  user?: User;
  signup_onboarding?: number;
  data?: {
    session_id?: string;
    session_identifier?: string;
    user_identifier?: string;
    access_token?: string;
    user?: User;
    signup_onboarding?: number;
  };
}

export interface GetUserProfileResponse {
  flag: number;
  message: string;
  error?: string;
  data?: {
    user_id?: number;
    flag?: number;
    user_name?: string;
    user_email?: string;
    phone_no?: string;
    user_image?: string;
    country_code?: string;
    date_of_birth?: string;
    email_verification_status?: number;
    gender?: number;
    profile?: {
      user_total_distance?: number;
    };
    user_addn_info?: {
      yelo_vendor_id?: string;
      user_otp_preference?: string;
    };
  };
}

export interface UpdateProfileRequest {
  updated_user_name: string;
  updated_user_email: string;
  image_file?: File;
}

export interface UpdateProfileResponse {
  flag: number;
  message: string;
  error?: string;
  data?: {
    user_image?: string; // Add this to capture the uploaded image URL
  };
}

// ======================== COMPONENT PROPS TYPES ========================

// Auth Component Props
export interface LoginDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onProceed?: (phoneNumber: string, countryCode: string) => void;
}

export interface SignupDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSignUp?: (data: SignupData) => void;
  initialPhoneNumber?: string;
  initialCountryCode?: string;
  signupOnboarding?: boolean;
}

export interface OtpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogin?: (otp: string) => void;
  onSignupOnboarding?: (phoneNumber: string, countryCode: string) => void;
  phoneNumber?: string;
  countryCode?: string;
  signupData?: SignupData | null;
}

export interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  placeholder?: string;
}

// Profile Component Props
export interface ProfileDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void;
}

// ======================== BOOKING TYPES ========================

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface Vehicle {
  id: number | string;
  type: string;
  name: string;
  description: string;
  capacity: number;
  image: string;
  basePrice: number;
  pricePerKm: number;
  pricePerMin: number;
  estimatedPrice?: number;
  estimatedTime?: number;
  available: boolean;
}

export interface Service {
  id: number | string;
  name: string;
  description: string;
  icon: string;
  price: number;
}

export interface PriceEstimate {
  vehicleId: string;
  basePrice: number;
  distancePrice: number;
  timePrice: number;
  serviceCharges: number;
  tax: number;
  discount: number;
  total: number;
  distance: number;
  duration: number;
}

export interface Booking {
  id: number | string;
  userId: string;
  vehicleId: string;
  vehicleType: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  pickup: Location;
  dropoff: Location;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  couponCode?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  vehicleId: string;
  pickup: Location;
  dropoff: Location;
  paymentMethod: string;
  couponCode?: string;
  scheduledAt?: string;
  services?: string[];
}

// ======================== PAYMENT TYPES ========================

export interface PaymentMethod {
  id: number | string;
  name: string;
  icon: string;
  enabled: boolean;
  description?: string;
}

export interface Coupon {
  id: number | string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minAmount?: number;
  validFrom: string;
  validTo: string;
  enabled: boolean;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  currency?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

// ======================== WALLET TYPES ========================

export interface Transaction {
  id: number | string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface AddMoneyData {
  amount: number;
  paymentMethod: string;
}

export interface FetchWalletBalanceRequest {
  latitude: number;
  longitude: number;
}

export interface FetchWalletBalanceResponse {
  flag: number;
  message: string;
  data?: {
    preference?: number;
    jugnoo_balance?: number;
    real_money_ratio?: number;
    payment_mode_config_data?: Array<{
      name: string;
      display_name?: string;
      enabled: number;
      available_payment_networks?: string[];
      [key: string]: any;
    }>;
    stripe_cards?: Array<{
      id: number;
      last_4: string;
      exp_month: number;
      exp_year: number;
      funding: string;
      brand: string;
      preference?: number;
      [key: string]: any;
    }>;
    paymentez_cards?: Array<any>;
    square_cards?: Array<any>;
    cancellation_debt?: number;
    cancel_count?: number;
    [key: string]: any;
  };
}

export interface TransactionHistoryItem {
  txn_id: number;
  amount: number;
  txn_type: number;
  logged_on: string;
  txn_datev2: string;
  txn_timev2: string;
  txn_text: string;
  currency?: string;
}

export interface GetTransactionHistoryRequest {
  login_type: number;
  locale: string;
  currency: string;
}

export interface GetTransactionHistoryResponse {
  flag: number;
  message?: string;
  banner?: string;
  balance?: number;
  num_txns: number;
  transactions: TransactionHistoryItem[];
}

// ======================== GOOGLE MAPS TYPES ========================

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  distanceValue: number;
  durationValue: number;
  steps: google.maps.DirectionsStep[];
  polyline: string;
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom?: number;
  disableDefaultUI?: boolean;
  styles?: google.maps.MapTypeStyle[];
}

// ======================== INITIALIZATION TYPES ========================

export interface DefaultResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface InitTasksResult {
  serviceAvailable: boolean;
  googleMapsKey?: string;
  sessionDetails?: any;
  error?: string;
}

// ======================== RIDE DRIVER DISCOVERY TYPES ========================

export interface VehicleService {
  eta: number;
  id: number;
  name: string;
  price: number;
  duration?: string;
  description?: string;
}

export interface RegionFare {
  fare: number;
  min_fare: number;
  max_fare: number;
  original_fare: number;
  fare_float: number;
  original_fare_float: number;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  per_km_fare?: number;
  per_min_fare?: number;
  pool_fare_id: string | number;
  currency_symbol: string;
  currency: string;
  tax_percentage: number;
  scheduled_ride_fare?: number;
  toll_charge?: number;
  convenience_charge?: number;
  ride_distance?: number;
  min_ride_time?: number;
  max_ride_time?: number;
  [key: string]: any;
}

export interface VehicleRegion {
  region_id: number;
  region_name: string;
  vehicle_type: number;
  ride_type: number;
  max_people: number;
  luggage_capacity?: number;
  images: {
    tab_normal: string;
    tab_highlighted?: string;
    ride_now_normal?: string;
    marker_icon?: string;
    [key: string]: string | undefined;
  };
  description?: string;
  disclaimer_text?: string;
  eta?: number;
  distance?: number;
  vehicle_services: VehicleService[];
  region_fare: RegionFare;
  is_pool?: boolean;
  fare_mandatory?: number;
  destination_mandatory?: number;
  multiple_destinations_enabled?: number;
  schedule_ride_disable?: number;
  instant_ride_disable?: number;
  [key: string]: any;
}

export interface FindDriverRequest {
  latitude: number;
  longitude: number;
  op_drop_latitude: number;
  op_drop_longitude: number;
  service_id?: number;
  ride_time: number;
  ride_distance: number;
  login_type?: number;
  show_toll_charge?: number;
  return_trip?: number;
  return_time?: string;
  pickup_time?: string;
}

export interface FindDriverResponse {
  flag: number;
  regions: VehicleRegion[];
  offset?: number;
  error?: string;
  message?: string;
}

export interface FindDriverOptions {
  serviceId?: number;
  isRoundTrip?: boolean;
  returnDateTime?: Date;
  rideDateTime?: Date;
  timezoneOffset?: number;
  scheduledFareFlow?: boolean;
}

export interface InsertPickupScheduleRequest {
  sessionId: string;
  sessionIdentifier: string;
  accessToken?: string; // defaults to hard-coded token
  regionId: number;
  serviceId: number;
  vehicleType: number;
  loginType?: number; // default 0
  latitude: number;
  longitude: number;
  pickupLocationAddress: string;
  pickupTime: Date | string;
  dropLatitude: number;
  dropLongitude: number;
  dropLocationAddress: string;
  passengerCount?: number;
  luggageCount?: number;
  customerNote?: string;
  preferredPaymentMode?: number; // default 1 (cash)
  cardId: any; // for card payments
}

export interface InsertPickupScheduleResponse {
  flag: number;
  message?: string;
  data?: {
    customer_fare_text: string;
    [key: string]: any;
  };
  [key: string]: any;
}
// ======================== HISTORY TYPES ========================

export interface ApiRideHistoryItem {
  pickup_address: string;
  drop_address: string;
  ride_type: number;
  manually_edited: number;
  vehicle_type: number;
  driver_id: number;
  distance: number;
  wait_time: number;
  is_cancelled_ride: number;
  ride_time: number;
  amount: number | null;
  autos_status: number;
  created_at: string;
  product_type: number;
  autos_status_color: string;
  autos_status_text: string;
  customer_fare_factor: number;
  cancellation_charges: number | null;
  date: string;
  images: any;
  is_rated_before: number;
  engagement_id: number;
  user_id: number;
  currency: string;
  distance_unit: string;
  utc_offset: string;
  pickup_latitude: number;
  pickup_longitude: number;
  drop_latitude: number;
  drop_longitude: number;
  driver_rating: number;
  currency_symbol: string;
  schedule_pickup_id: number;
  region_name: string;
  history_icon: string;
  // Scheduled ride fields
  is_upcoming_ride?: number | string;
  pickup_id?: number;
  pickup_location_address?: string;
  drop_location_address?: string;
  pickup_time?: string;
  customer_fare_estimate?: number;
  vehicle_name?: string;
  estimated_distance?: number;
  status?: number;
  op_drop_latitude?: number;
  op_drop_longitude?: number;
  latitude?: number;
  longitude?: number;
  preferred_payment_mode?: number;
}

export interface HistoryRequest {
  start_from: number | string;
  show_custom_fields: number;
  login_type: number | string;
  locale: string;
  offering_array?: number[];
}

export interface HistoryResponse {
  flag: number;
  message?: string;
  data: ApiRideHistoryItem[];
}

export interface RideSummaryRequest {
  engagement_id: number | string;
  locale: string;
}

export interface RideSummaryResponse {
  flag: number;
  message?: string;
  data: any; // Detailed ride summary
}
