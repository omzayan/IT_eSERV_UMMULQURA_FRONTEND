// Legacy interface - now using CommonResponse from api.types.ts
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}
