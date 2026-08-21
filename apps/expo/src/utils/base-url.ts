import Constants from "expo-constants";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 *
 * In development, this auto-detects the host from Expo config.
 * If hostUri is not available (e.g., production build), falls back to localhost:3000.
 * To use a production URL, either:
 *   1. Set the BASE_URL environment variable, or
 *   2. Override this function in your code to return your production API URL.
 */
export const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL. See: https://github.com/acme/matchfight#production-setup
   */
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  // If hostUri is available, use it; otherwise fall back to localhost:3000
  // Users can set BASE_URL env var or override this function for production
  if (!localhost) {
    const envBaseUrl = process?.env?.BASE_URL;
    if (envBaseUrl) {
      return envBaseUrl;
    }
    // Fallback to localhost for development when hostUri is not available
    return `http://localhost:3000`;
  }
  return `http://${localhost}:3000`;
};
