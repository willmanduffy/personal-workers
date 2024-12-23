import { z } from "zod";

export const AirthingsLatestSamplesSchema = z.object({
  data: z.object({
    battery: z.number(),
    co2: z.number(),
    humidity: z.number(),
    pm1: z.number(),
    pm25: z.number(),
    pressure: z.number(),
    radonShortTermAvg: z.number(),
    temp: z.number(),
    time: z.number(),
    voc: z.number(),
  }),
});

export type AirthingsLatestSamples = z.infer<
  typeof AirthingsLatestSamplesSchema
>;

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
