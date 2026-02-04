export interface LoginCredentials {
  username: string;
  password: string;
  appVersion?: string;   // e.g. "1.0.0"
  buildNumber?: string;  // e.g. "102"
  osName?: string;       // e.g. "Windows", "iOS"
  osVersion?: string;    // e.g. "10", "15.1"
  deviceModel?: string;  // e.g. "iPhone", "Pixel 6", or "Chrome on Windows"
}