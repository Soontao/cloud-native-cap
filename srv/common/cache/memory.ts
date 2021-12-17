
import { hash } from "@newdash/newdash/functional/hash";
import { LRUMap } from "@newdash/newdash/functional/LRUMap";
import { Cache, CacheProvider } from "./type";

export class MemoryCache<K, V> implements Cache<K, V> {

  private _cache: Map<string, V>;

  constructor(maximumKeys = 10000) {
    this._cache = new LRUMap<string, V>(maximumKeys);
  }

  /**
   * convert any object to string key
   * 
   * @param k 
   * @returns 
   */
  private _toKey(k: any) {
    return hash(k);
  }

  public async set(key: K, value: V): Promise<void> {
    this._cache.set(this._toKey(key), value);
  }

  public async del(...keys: K[]): Promise<void> {
    for (const key of keys) {
      this._cache.delete(this._toKey(key));
    }
  }

  public async get(key: K): Promise<V | null> {
    const value = this._cache.get(this._toKey(key));
    if (value === undefined) {
      return null;
    }
    return value;
  }

}

export class MemoryCacheProvider implements CacheProvider {

  private _caches: Map<string, Cache<any, any>> = new LRUMap<string, Cache<any, any>>(10000); // avoid OOM

  async provision<K, V>(cacheId: string): Promise<Cache<K, V>> {
    if (!this._caches.has(cacheId)) {
      this._caches.set(cacheId, new MemoryCache<K, V>());
    }
    return this._caches.get(cacheId) as Cache<K, V>;
  }

}
