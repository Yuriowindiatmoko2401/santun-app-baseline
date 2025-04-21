import Redis from 'ioredis';
import { debugLogger } from './debug-local';

// This file provides a local Redis client with API compatibility with @upstash/redis
// It implements the same interface methods we need but connects to a local Redis instance

class LocalRedisClient {
  private client: Redis;

  constructor(url: string = 'redis://localhost:6379') {
    this.client = new Redis(url);
  }

  // Get type of a key
  async type(key: string): Promise<string> {
    debugLogger.redis(`TYPE ${key}`);
    return this.client.type(key);
  }

  // Redis Hash commands
  async hset(key: string, values: Record<string, any>): Promise<number> {
    debugLogger.redis(`HSET ${key}`, values);
    const args = [key];
    Object.entries(values).forEach(([field, value]) => {
      args.push(field, typeof value === 'object' ? JSON.stringify(value) : String(value));
    });
    const result = await this.client.hset(args);
    return result;
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    debugLogger.redis(`HGETALL ${key}`);
    const result = await this.client.hgetall(key);
    debugLogger.redis(`HGETALL result for ${key}`, result);
    return result || {};
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  // Redis Set commands
  async sadd(key: string, member: string): Promise<number> {
    return this.client.sadd(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  // Redis Sorted Set commands
  async zadd(key: string, { score, member }: { score: number; member: string }): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  async zrange(key: string, min: number, max: number): Promise<string[]> {
    return this.client.zrange(key, min, max);
  }

  // Redis Scan command
  async scan(cursor: string, options: { match?: string; count?: number; type?: string }): Promise<[string, string[]]> {
    const { match, count } = options;
    const args: (string | number)[] = [cursor];
    
    if (match) {
      args.push('MATCH', match);
    }
    
    if (count) {
      args.push('COUNT', count);
    }
    
    // Note: The TYPE option is not supported in IORedis scan
    // We're ignoring it for local development
    
    const [nextCursor, keys] = await this.client.scan(...args) as [string, string[]];
    return [nextCursor, keys];
  }

  // Pipeline for batch operations
  pipeline() {
    const pipeline = this.client.pipeline();
    
    return {
      hgetall: (key: string) => {
        pipeline.hgetall(key);
        return pipeline;
      },
      exec: async () => {
        const results = await pipeline.exec();
        return results?.map(([err, result]: [Error | null, any]) => {
          if (err) throw err;
          return result;
        }) || [];
      }
    };
  }
}

export const localRedis = new LocalRedisClient(process.env.REDIS_URL);
