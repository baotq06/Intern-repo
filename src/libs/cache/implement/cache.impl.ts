/* eslint-disable no-await-in-loop */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-case-declarations */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Cache, { Time } from '../interface/cache';
import Storage, { StorageData } from '../interface/storage';

function toMillis(time: Time) {
  const millis = time.milliseconds || 0;
  const seconds = time.seconds || 0;
  const minutes = time.minutes || 0;

  return minutes * 60000 + seconds * 1000 + millis;
}
type TimeInMs = number;
const sleep = async (ms: TimeInMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const defaultFnCallTimeout: Time = { seconds: 30 };
const SLEEP_TIME_MS = 300;

export default function implementCache(md5: any, storage: Storage): Cache {
  async function getData(
    identifier: string,
    args: any[],
    refreshCycle: Time,
    expireCycle: Time,
    callback: any,
    fnCallTimeout = defaultFnCallTimeout,
    retrySleepDuration = SLEEP_TIME_MS,
  ): Promise<any> {
    const startTime = Date.now();
    const retryDuration = toMillis(fnCallTimeout);
    const key: string = identifier + md5(args.join('|'));
    const currentMillis = new Date().getTime();
    const expire = toMillis(expireCycle);
    const refresh = Math.min(toMillis(refreshCycle), expire);

    async function refreshData(): Promise<any> {
      try {
        storage.startRefreshing(key);
        const data = await callback(...args);
        storage.stopRefreshing(key);
        if (data !== undefined && data !== null) {
          storage.set(key, {
            args,
            expiredAtInMillis: currentMillis + expire,
            refreshAtInMillis: currentMillis + refresh,
            response: data,
          });

          return data;
        }

        return null;
      } catch (err: any) {
        console.log('refreshing failed: ', err?.message);
        storage.stopRefreshing(key);
        // throw err;
      }
    }

    // eslint-disable-next-line no-unreachable-loop
    while (Date.now() - startTime < retryDuration) {
      let cacheHitStatus: string;
      const cacheData: StorageData = storage.get(key, args);
      if (cacheData === null) {
        cacheHitStatus = 'MISS';
      } else if (currentMillis >= cacheData.expiredAtInMillis) {
        cacheHitStatus = 'EXPIRED';
      } else if (currentMillis < cacheData.refreshAtInMillis) {
        cacheHitStatus = 'HIT';
      } else if (storage.isRefreshing(key)) {
        cacheHitStatus = 'REFRESHING';
      } else {
        cacheHitStatus = 'NEED_REFRESH';
      }

      switch (cacheHitStatus) {
        case 'REFRESHING':
        case 'HIT':
          return cacheData.response;
        case 'NEED_REFRESH':
          refreshData();

          return cacheData.response;
        case 'MISS':
        case 'EXPIRED':
          if (storage.isRefreshing(key)) {
            await sleep(retrySleepDuration);
            break;
          }
          const newData = await refreshData();

          return newData;
        default:
          // Cannot reach
          return null;
      }
    }

    return null;
  }

  return {
    getData,
  };
}
