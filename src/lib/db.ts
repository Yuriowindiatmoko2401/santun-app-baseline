import { Redis } from "@upstash/redis";
import { localRedis } from "./db-local";

// Use local Redis in development, Upstash in production
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';

export const redis = isLocalDev 
  ? localRedis 
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
