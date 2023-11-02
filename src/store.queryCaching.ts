import { cachePromise, clearCache } from 'src/utils/cache.util';
import { isArray } from 'src/utils/common.util';
import { defaultResponse } from './store.constants';
import { handleQueryError, handleQuerySuccess, QueryActionError, QueryActionSuccess } from './store.query';
import { TData, StateCreator } from './store.typings';

export interface FetcherParams<Model> {
  queryKey: string;
  fetcher: () => Promise<Model>;
  fetchDataSuccess?: QueryActionSuccess;
  fetchDataError?: QueryActionError;
  expiredTime: number;
  isFresh?: boolean;
}

export type QueryOptions = {
  queryKey?: string;
};

export type FetcherParamsNoCache<Model> = Pick<FetcherParams<Model>, 'fetcher' | 'fetchDataSuccess' | 'fetchDataError'>;

export interface QueryState<TData> {
  data: TData;
  isLoading: boolean;
  isLoaded: boolean;
  queryKey?: string;
  dataByKeys: QueryState<TData>[];
}

export interface QueryActions<TData> {
  setData: (data: TData, options?: QueryOptions) => void;
  fetchData: (params: FetcherParams<TData>) => Promise<TData>;
  fetchDataByKey: (params: FetcherParams<TData>) => Promise<TData>;
  fetchDataNoCache: (params: FetcherParamsNoCache<TData>) => Promise<TData>;
  fetchDataNoCacheByKey: (params: FetcherParamsNoCache<TData> & QueryOptions) => Promise<TData>;
  setLoading: (isLoading: boolean, options?: QueryOptions) => void;
  setLoaded: (isLoaded: boolean, options?: QueryOptions) => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (response: TData) => void;
  setDataEmpty: () => void;
  setDataByKey: (key: string, callback: (d: QueryState<TData>, index: number) => Partial<QueryState<TData>>) => void;
}

export type QueryStore<TData> = QueryState<TData> & QueryActions<TData>;

export const defaultQueryState: QueryState<TData> = {
  data: undefined,
  isLoading: true,
  isLoaded: false,
  dataByKeys: [],
  queryKey: undefined,
};

export const queryStateCreator: StateCreator<QueryStore<TData>> = (set, get) => ({
  ...defaultQueryState,
  /* `setData` is a function that takes in a parameter `data` and sets the `data` property of the query
  state to the value of `data`. It does this by calling the `set` function provided by the
  `stateCreator` and passing in an object with a `data` property set to the value of `data`. The
  `set` function is a function provided by the `zustand` library that allows for updating the state
  of the store. This function is used to update the `data` property of the query state. */
  setData: (data, { queryKey } = {}) => {
    if (queryKey) {
      const { setDataByKey } = get();
      setDataByKey(queryKey, () => ({ data }));
    } else {
      set({ data });
    }
  },
  setLoaded: (isLoaded, { queryKey } = {}) => {
    if (queryKey) {
      const { setDataByKey } = get();
      setDataByKey(queryKey, () => ({ isLoaded }));
    } else {
      set({ isLoaded });
    }
  },
  /* A function that is used to set the state of the `isLoading` property. */
  /* `setLoading` is a function that takes in a boolean value `isLoading` as a parameter and sets the
  `isLoading` property of the query state to that value using the `set` function provided by the
  `stateCreator`. The `set` function is a function provided by the `zustand` library that allows for
  updating the state of the store. In this case, it is used to update the `isLoading` property of
  the query state. */
  setLoading: (isLoading, { queryKey } = {}) => {
    if (queryKey) {
      const { setDataByKey } = get();
      setDataByKey(queryKey, () => ({ isLoading }));
    } else {
      set({ isLoading });
    }
  },
  /* A function that is used to fetch data from the server. */
  /* The `fetchData` function is a method that fetches data from a server using a provided `fetcher`
function. It takes in an object with several parameters such as `queryKey`, `expiredTime`,
`fetchDataSuccess`, `fetchDataError`, and `isFresh`. */
  fetchData: async ({ queryKey, expiredTime, fetchDataSuccess, fetchDataError, fetcher, isFresh }) => {
    const { setLoaded, setLoading, setData, onError, onSuccess } = get();
    let response: TData = defaultResponse;
    try {
      setLoading(true);
      if (isFresh) {
        clearCache(queryKey);
      }
      response = await cachePromise({ key: queryKey, promiseFunc: fetcher, expiredTime });
      setData(response);
      handleQuerySuccess({ onSuccess, fetchDataSuccess, response });
    } catch (error) {
      ``;
      handleQueryError({ error, fetchDataError, onError });
    } finally {
      setLoading(false);
      setLoaded(true);
    }
    return response;
  },
  /* `fetchDataNoCache` is a function that fetches data from the server without using caching. It takes
  in an object with `fetchDataSuccess`, `fetchDataError`, and `fetcher` properties as parameters.
  Inside the function, it sets the `isLoading` state to true, calls the `fetcher` function to get
  the data, sets the `data` state to the fetched data, and calls the `handleQuerySuccess` function
  with the `onSuccess` and `fetchDataSuccess` parameters. If there is an error, it calls the
  `handleQueryError` function with the `fetchDataError` and `onError` parameters. Finally, it sets
  the `isLoading` state to false and the `isLoaded` state to true, and returns the fetched data. */
  fetchDataNoCache: async ({ fetchDataSuccess, fetchDataError, fetcher }) => {
    const { setLoaded, setLoading, setData, onError, onSuccess } = get();
    let response: TData = defaultResponse;
    try {
      setLoading(true);
      response = await fetcher();
      setData(response);
      handleQuerySuccess({ onSuccess, fetchDataSuccess, response });
    } catch (error) {
      handleQueryError({ error, fetchDataError, onError });
    } finally {
      setLoading(false);
      setLoaded(true);
    }
    return response;
  },
  /* This is a callback function that is called when the `fetchData` function is successful. */
  /* `onSuccess` is a callback function that is called when the `fetchData` function is successful. In
  this specific implementation, it simply logs a message to the console using `console.info()`. This
  function can be customized to perform any action that needs to be taken after the data has been
  successfully fetched from the server. */
  onSuccess: (response) => {
    console.info('Callback handle response', response);
  },
  /* This is a callback function that is called when the `fetchData` function is successful. */
  /* `onError` is a callback function that is called when there is an error in the `fetchData`
  function. In this specific implementation, it simply logs an error message to the console using
  `console.error()`. This function can be customized to perform any action that needs to be taken
  when there is an error in fetching data from the server. */
  onError: (error) => {
    console.error('Callback handle error', error);
  },
  /* `setDataEmpty` is a function that sets the `data` property of the query state to an empty array if
  the current value of `data` is an array, or to `null` if the current value of `data` is not an
  array. It also sets the `isLoaded` property to `true` and the `isLoading` property to `false`.
  This function is useful for cases where the query needs to be reset and the data needs to be
  cleared. */
  setDataEmpty: () => {
    const { data } = get();
    set({ data: isArray(data) ? [] : null, isLoaded: true, isLoading: false });
  },
  /* `fetchDataByKey` is a function that fetches data from the server and updates the state of a
  specific query identified by its `queryKey`. It takes in an object with several parameters such as
  `isFresh`, `queryKey`, `expiredTime`, `fetchDataSuccess`, `fetchDataError`, and `fetcher`. Inside
  the function, it sets the `isLoading` state to true for the specific query identified by
  `queryKey`, clears the cache if `isFresh` is true, calls the `fetcher` function to get the data,
  sets the `data` state of the specific query identified by `queryKey` to the fetched data using
  `setDataByKey` function, and calls the `handleQuerySuccess` function with the `onSuccess` and
  `fetchDataSuccess` parameters. If there is an error, it calls the `handleQueryError` function with
  the `fetchDataError` and `onError` parameters. Finally, it sets the `isLoading` state to false and
  the `isLoaded` state to true for the specific query identified by `queryKey`, and returns the
  fetched data. */
  fetchDataByKey: async ({
    isFresh,
    queryKey,
    fetcher,
    fetchDataError,
    fetchDataSuccess,
    expiredTime,
  }: FetcherParams<TData>) => {
    const { setLoaded, setLoading, setData, onError, onSuccess } = get();
    let response: TData = defaultResponse;
    try {
      setLoading(true, { queryKey });
      if (isFresh) {
        clearCache(queryKey);
      }
      response = await cachePromise({ key: queryKey, promiseFunc: fetcher, expiredTime });
      setData(response, { queryKey });
      handleQuerySuccess({ onSuccess, fetchDataSuccess, response });
    } catch (error) {
      handleQueryError({ error, fetchDataError, onError });
    } finally {
      setLoading(false, { queryKey });
      setLoaded(true, { queryKey });
    }
    return response;
  },
  /* `fetchDataNoCacheByKey` is a function that fetches data from the server without using caching, but
 it also allows updating the state of a specific query identified by its `queryKey`. It takes in an
 object with `fetcher`, `queryKey`, `fetchDataError`, and `fetchDataSuccess` properties as
 parameters. Inside the function, it sets the `isLoading` state to true, calls the `fetcher`
 function to get the data, sets the `data` state to the fetched data using `setDataByKey` function,
 and calls the `handleQuerySuccess` function with the `onSuccess` and `fetchDataSuccess` parameters.
 If there is an error, it calls the `handleQueryError` function with the `fetchDataError` and
 `onError` parameters. Finally, it sets the `isLoading` state to false and the `isLoaded` state to
 true, and returns the fetched data. */
  fetchDataNoCacheByKey: async ({
    fetcher,
    queryKey,
    fetchDataError,
    fetchDataSuccess,
  }: FetcherParamsNoCache<TData> & QueryOptions) => {
    const { setLoaded, setLoading, setData, onError, onSuccess } = get();
    let response: TData = defaultResponse;
    try {
      setLoading(true, { queryKey });
      response = await fetcher();
      setData(response, { queryKey });
      handleQuerySuccess({ onSuccess, fetchDataSuccess, response });
    } catch (error) {
      handleQueryError({ error, fetchDataError, onError });
    } finally {
      setLoading(false, { queryKey });
      setLoaded(true, { queryKey });
    }
    return response;
  },
  /* `setDataByKey` is a function that allows updating the state of a specific query identified by its
 `queryKey`. It takes in two parameters: `key` which is the `queryKey` of the query to be updated,
 and `callback` which is a function that takes in the current state of the query and its index in
 the `dataByKeys` array, and returns an object with the properties to be updated. */
  setDataByKey: (key: string, callback: (d: QueryState<TData>, index: number) => Partial<QueryState<TData>>) => {
    const { dataByKeys } = get();
    const foundIndex = dataByKeys.findIndex((d) => d.queryKey === key);
    if (foundIndex === -1) {
      // not found => init state by mutation key
      set({
        dataByKeys: [
          ...dataByKeys,
          { ...defaultQueryState, ...callback(defaultQueryState, foundIndex), queryKey: key },
        ],
      });
    } else {
      // existed => update state by mutation key
      set({
        dataByKeys: dataByKeys.map((i: QueryState<TData>, index) => {
          if (index !== foundIndex) {
            return i;
          }
          return { ...i, ...callback(i, index) };
        }),
      });
    }
  },
});
