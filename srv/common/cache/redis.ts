import { hash } from "@newdash/newdash/functional/hash";
import { createClient, RedisClient } from "redis";
import { Cache, CacheProvider } from "./type";


export class RedisCacheProvider implements CacheProvider {

  private _client: RedisClient;

  public async connect(): Promise<RedisCacheProvider> {
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
        resolve(this);
      });
    });
  }

  public provision<K, V>(cacheId: string): Promise<Cache<K, V>> {
    return new RedisCache<K, V>(this._client, cacheId) as any;
  }


  public stop() {
    this._client.end(true);
  }
  
}

export class RedisCache<K, V> implements Cache<K, V> {
  
  private _client: RedisClient;

  private _prefix: string;

  constructor(client: RedisClient, prefix: string) {
    this._client = client;
    this._prefix = prefix;
  }

  private _toKey(key: K) {
    return hash(this._prefix, key);
  }

  public async set(key: K, value: V, timeout?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const cb = (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      };

      // @ts-ignore
      value = JSON.stringify(value);

      if (timeout !== undefined && timeout > 0) {
        // @ts-ignore
        this._client.setex(this._toKey(key), timeout, value, cb);
      } else {
        // @ts-ignore
        this._client.set(this._toKey(key), value, cb);
      }
    });
  }

  public async del(...keys: Array<K>): Promise<void> {
    return callToPromise(this._client.del, this._client, ...(keys.map(key => this._toKey(key))));
  }


  public async get(key: K): Promise<any> {
    return new Promise((resolve, reject) => {
      this._client.get(this._toKey(key), (err, reply) => {
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
