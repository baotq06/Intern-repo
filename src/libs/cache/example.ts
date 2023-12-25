import initCache from '.';

// init a cache that save data by key, limit in 100 key
// if user add another key and there is 100 key in cache, it will auto delete a random key
const cache = initCache(100);

// using
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testCache(): Promise<any> {
  const aData = await cache.getData(
    'example', // main key
    ['id', 1, 'something in that provide this unique key'], // args provide identifier of this key
    {
      // refresh time, after this amount time will call refresh if call getData, return immediately, note await
      // milliseconds: 1000,
      // seconds: 1,
      minutes: 10,
    },
    {
      // expire time, expire time of cache, wait until get data succeed
      // milliseconds: 1000,
      // seconds: 1,
      minutes: 60,
    },
    async () => Promise.resolve('request body'), // function get data
  );
  
return aData;
}
