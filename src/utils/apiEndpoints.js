const BASE_URL = "http://localhost:8080/api/v1.0";

export const apiEndpoints = {
  // File endpoints
  FETCH_FILES: `${BASE_URL}/files/my`,
  TOGGLE_FILE: (id) => `${BASE_URL}/files/${id}/toggle-public`,
  UPLOAD_FILE: `${BASE_URL}/files/upload`,
  DELETE_FILE: (id) => `${BASE_URL}/files/${id}`,
  DOWNLOAD_FILE: (id) => `${BASE_URL}/files/download/${id}`,
  PUBLIC_FILE: (id) => `${BASE_URL}/files/public/${id}`,

  // User & Account endpoints
  GET_USER_CREDITS: `${BASE_URL}/users/credits`,
  GET_CREDITS: `${BASE_URL}/users/credits`,

  // Payments & Subscription endpoints
  CREATE_ORDER: `${BASE_URL}/payments/create-order`,
  VERIFY_PAYMENT: `${BASE_URL}/payments/verify-payment`,
  GET_TRANSACTIONS: `${BASE_URL}/transactions`,

  // Webhooks
  CLERK_WEBHOOK: `${BASE_URL}/webhooks/clerk`,                  
};
