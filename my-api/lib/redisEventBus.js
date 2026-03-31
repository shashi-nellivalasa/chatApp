import Redis from "ioredis";
import { EventEmitter } from "events";
import dotenv from "dotenv";
dotenv.config();

const redisConfig = process.env.REDIS_URI;

class EventBus {
  constructor() {
    this.handlers = new Map();
    // Default to Redis if REDIS_URI is set, otherwise use local in-memory event bus
    this.useRedis = !!redisConfig;

    if (this.useRedis) {
      // Connect to Redis with retry limit so it doesn't spam infinitely if disconnected
      this.pubClient = new Redis(redisConfig, {
        retryStrategy: (times) => Math.min(times * 100, 3000), // stop spamming quickly
      });
      this.subClient = new Redis(redisConfig, {
        retryStrategy: (times) => Math.min(times * 100, 3000),
      });

      this.subClient.on("message", (channel, message) => {
        if (this.handlers.has(channel)) {
          try {
            const data = JSON.parse(message);
            this.handlers.get(channel).forEach((handler) => handler(data));
          } catch (error) {
            console.error(
              `Error processing message on channel ${channel}:`,
              error,
            );
          }
        }
      });

      this.pubClient.on("connect", () =>
        console.log("Redis Publisher Connected!"),
      );
      this.subClient.on("connect", () =>
        console.log("Redis Subscriber Connected!"),
      );

      this.pubClient.on("error", (err) =>
        console.log(
          "Redis Publisher Connection Error (Make sure Redis is running!):",
          err?.message || err,
        ),
      );
      this.subClient.on("error", (err) =>
        console.log(
          "Redis Subscriber Connection Error (Make sure Redis is running!):",
          err?.message || err,
        ),
      );
    } else {
      console.log(
        "⚠️ No REDIS_URI provided in .env. Falling back to local Node.js EventEmitter.",
      );
      this.localBus = new EventEmitter();
    }
  }

  publish(channel, data) {
    if (this.useRedis) {
      const stringifiedData = JSON.stringify(data);
      this.pubClient.publish(channel, stringifiedData);
    } else {
      this.localBus.emit(channel, data);
    }
  }

  subscribe(channel, handler) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      if (this.useRedis) {
        this.subClient.subscribe(channel, (err, count) => {
          if (err) {
            console.error(`Failed to subscribe to ${channel}:`, err);
          } else {
            console.log(`Subscribed to ${channel} via Redis.`);
          }
        });
      } else {
        // Set up local bus listener exactly once per channel
        this.localBus.on(channel, (data) => {
          if (this.handlers.has(channel)) {
            this.handlers.get(channel).forEach((h) => h(data));
          }
        });
        console.log(`Subscribed to ${channel} via Local EventEmitter.`);
      }
    }
    this.handlers.get(channel).push(handler);
  }

  unsubscribe(channel) {
    if (this.handlers.has(channel)) {
      this.handlers.delete(channel);
      if (this.useRedis) {
        this.subClient.unsubscribe(channel);
      } else {
        this.localBus.removeAllListeners(channel);
      }
      console.log(`Unsubscribed from ${channel}`);
    }
  }

  close() {
    if (this.useRedis) {
      this.pubClient.quit();
      this.subClient.quit();
    } else {
      this.localBus.removeAllListeners();
    }
  }
}

const eventBus = new EventBus();
export default eventBus;
