import { Service } from "@sap/cds";
import { createClient, RedisClient } from "redis";
import { CacheService } from ".";

export class RedisService extends Service implements CacheService {
  private _client: RedisClient;

  async init() {
    await this.connect();
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client = createClient({
        host: process.env.REDIS_HOST
      });
      let connected = false;
      this._client.on("error", (error) => {
        if (!connected) {
          reject(error);
        }
        this._client.end(false);
        console.error(error);
      });
      this._client.on("connect", () => {
        connected = true;
        resolve();
      });
    });
  }

  public async set(key: string, value: any, timeout?: number): Promise<"OK"> {
    return new Promise((resolve, reject) => {
      const cb = (err: Error, reply: "OK") => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      };

      value = JSON.stringify(value);

      if (timeout !== undefined) {
        this._client.setex(key, timeout, value, cb);
      } else {
        this._client.set(key, value, cb);
      }
    });
  }

  public async del(...keys: Array<string>): Promise<void> {
    return callToPromise(this._client.del, this._client, ...keys);
  }

  public stop() {
    this._client.end(true);
  }

  public async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve(JSON.parse(reply));
          } catch (error) {
            // ignore error
            resolve(reply);
          }
        }
      });
    });
  }
}

function callToPromise<R>(func: Function, ctx: any, ...args: any[]): Promise<R> {
  return new Promise((resolve, reject) => {
    func.call(ctx, ...args, (err: Error, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as R);
      }
    });
  });
}
