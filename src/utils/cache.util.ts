import { get, set } from 'src/utils/common.util';

export const caches: Record<string, any> = {};

export const cache = (key: string, data: any, expiredTime: number) => {
  set(caches, key, {
    data,
    expiredTime: new Date().getTime() + expiredTime,
  });
};

export const getCache = (key: string) => {
  const cacheData = get(caches, key);
  if (!cacheData) {
    return undefined;
  }
  const isExpired = cacheData.expiredTime < new Date().getTime();
  if (!isExpired) {
    return cacheData.data;
  }
};

export const clearCache = (key: string) => {
  if (!caches[key]) {
    return;
  }
  delete caches[key];
};

export const cachePromise = async ({
  key,
  promiseFunc,
  expiredTime,
}: {
  key: string;
  promiseFunc: () => Promise<any>;
  expiredTime?: number;
}) => {
  const cachedData = getCache(key);
  if (cachedData) {
    return cachedData;
  }
  const data = await promiseFunc();
  cache(key, data, expiredTime || 60 * 1e3);
  return data;
};
