import {
  AirthingsLatestSamples,
  AirthingsLatestSamplesSchema,
  TokenResponse,
  TokenResponseSchema,
} from "./airthings.types";
import { KVNamespace } from "@cloudflare/workers-types";
import { z } from "zod";

export class AirthingsClient {
  private readonly baseUrl = "https://ext-api.airthings.com/v1";
  private readonly authUrl = "https://accounts-api.airthings.com/v1";
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly kv: KVNamespace;
  private token: string | null = null;

  constructor(clientId: string, clientSecret: string, kv: KVNamespace) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.kv = kv;
  }

  private async getStoredToken(): Promise<string | null> {
    return this.kv.get("airthings_token");
  }

  private async storeToken(token: string): Promise<void> {
    await this.kv.put("airthings_token", token);

    this.token = token;
  }

  private async fetchNewToken(): Promise<TokenResponse> {
    const response = await fetch(`${this.authUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: ["read:device:current_values"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`);
    }

    const data = await response.json();
    return TokenResponseSchema.parse(data);
  }

  private async ensureToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await this.getStoredToken();
    }

    if (!this.token) {
      const tokenResponse = await this.fetchNewToken();
      await this.storeToken(tokenResponse.access_token);
    }

    return this.token;
  }

  /**
   * Makes an authenticated request to the Airthings API
   * @param path The API endpoint path
   * @param options Additional fetch options
   * @returns The parsed JSON response
   */
  private async request<T extends z.ZodType>(
    path: string,
    schema: T,
    options: RequestInit = {}
  ): Promise<z.infer<T>> {
    const token = await this.ensureToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be expired, fetch a new one and retry
      const newTokenResponse = await this.fetchNewToken();
      await this.storeToken(newTokenResponse.access_token);

      // Retry the request with the new token
      const retryResponse = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`Airthings API error: ${retryResponse.statusText}`);
      }

      const data = await retryResponse.json();
      return schema.parse(data);
    }

    if (!response.ok) {
      throw new Error(`Airthings API error: ${response.statusText}`);
    }

    const data = await response.json();
    return schema.parse(data);
  }

  /**
   * Get the latest sensor values for a specific device
   * @param serialNumber The serial number of the Airthings device
   * @returns Latest sensor readings from the device
   */
  async getLatestSamples(
    serialNumber: string
  ): Promise<AirthingsLatestSamples> {
    return this.request(
      `/devices/${serialNumber}/latest-samples`,
      AirthingsLatestSamplesSchema
    );
  }
}
