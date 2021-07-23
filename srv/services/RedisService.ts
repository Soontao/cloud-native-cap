import { createClient, RedisClient } from "redis";

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

export class RedisService {
  private _client: RedisClient;

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

  public async delete(...keys: Array<string>): Promise<void> {
    return callToPromise(this._client.del, this._client, ...keys);
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

export const defaultRedisService = new RedisService();