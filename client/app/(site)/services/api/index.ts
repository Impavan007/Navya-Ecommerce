/**
 * Centralized API Services for User Section
 * Main entry point for all API services
 */

import { authApiService } from "./auth";
import { productsApiService } from "./products";
import { cartApiService } from "./cart";
import { bookingsApiService } from "./bookings";
import { userApiService } from "./user";
import { settingsApiService } from "./settings";
import { messagesApiService } from "./messages";
import { howItWorksApiService } from "./howItWorks";
import { newsletterApiService } from "./newsletter";
import { aiApiService } from "./ai";

// Individual API Service Exports for better tree-shaking
export { authApiService as auth } from "./auth";
export { productsApiService as products } from "./products";
export { cartApiService as cart } from "./cart";
export { bookingsApiService as bookings } from "./bookings";
export { userApiService as user } from "./user";
export { settingsApiService as settings } from "./settings";
export { messagesApiService as messages } from "./messages";
export { howItWorksApiService as howItWorks } from "./howItWorks";
export { newsletterApiService as newsletter } from "./newsletter";
export { aiApiService as ai } from "./ai";

// Legacy collection for compatibility (will be tree-shaken if not used)
export const apiServices = {
  auth: authApiService,
  products: productsApiService,
  cart: cartApiService,
  bookings: bookingsApiService,
  user: userApiService,
  settings: settingsApiService,
  messages: messagesApiService,
  howItWorks: howItWorksApiService,
  newsletter: newsletterApiService,
  ai: aiApiService,
};

// Re-export types for convenience
export type {
  SignInRequest,
  SignInResponse,
  Product,
  Cart,
  Booking,
  User,
  PaginatedResponse,
  ApiResponse,
} from "../../types/api";

// Re-export base service for advanced usage
import { baseApiService } from "./base";
export { baseApiService };

// API Service class for advanced usage
export class ApiService {
  constructor() {
    // Initialize any global API settings here
  }

  // Convenience methods for common operations
  async healthCheck(): Promise<boolean> {
    try {
      await baseApiService.get("/health");
      return true;
    } catch {
      return false;
    }
  }

  // Global error handler (could be extended)
  handleError(error: any): void {
    console.error("API Error:", error);
    // Could integrate with error tracking service here
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Default export for easy importing
export default apiServices;
