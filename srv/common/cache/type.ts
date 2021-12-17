export interface Cache<K = string, V = any> {
  set(key: K, value: V, timeout?: number): Promise<void>;
  del(...keys: Array<K>): Promise<void>;
  get(key: K): Promise<V>;
}

export interface CacheProvider {
  provision<K, V>(cacheId: string): Promise<Cache<K, V>>;
}
