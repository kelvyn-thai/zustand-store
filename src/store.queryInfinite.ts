import { isEqual, uniqBy } from 'src/utils/common.util';
import { GeneralListResponse } from 'src/models/response/GeneralList.response';
import { findDifferenceItems } from './store.utils';
import { StateCreator, TData, TFilter } from './store.typings';
import { defaultResponse } from './store.constants';
import { QueryActionError, QueryActionSuccess, handleQueryError, handleQuerySuccess } from './store.query';
import { unstable_batchedUpdates } from 'react-dom';

export type Fetcher<Model, Filter> = (
  filter: Filter,
  options: {
    pageIndex?: number;
    pageSize?: number;
  }
) => Promise<GeneralListResponse<Model>>;

export interface FetcherParams<Model, Filter> {
  fetcher: Fetcher<Model, Filter>;
  fetchDataSuccess?: QueryActionSuccess;
  fetchDataError?: QueryActionError;
}

export interface FetcherExactPageParams<Model, Filter> extends FetcherParams<Model, Filter> {
  page: number;
}

/* Defining the state of the query store. */
export interface QueryState<TData, TFilter> {
  data: TData[];
  filter: TFilter;
  isLoading: boolean; // isLoading: true && isLoaded: false => first time => need load data
  isLoaded: boolean; // isLoading: false && isLoaded: true => loaded data
  isRefreshing: boolean; // isRefreshing: refreshing data
  isFetchingExactPage: boolean; //  isFetchingExactPage: true => fetching exact page (for update detail item)
  hasNextPage: boolean;
  pageIndex: number;
  pageSize: number;
  isFetchingNextPage: boolean;
}
/* A type definition for the actions that will be available in the query store. */
export interface QueryActions<TData, TFilter> {
  setData: (data: TData[]) => void;
  setFilter: (f: TFilter) => void;
  resetFilter: (f: TFilter) => void;
  setLoading: (isLoading: boolean) => void;
  setLoaded: (isLoaded: boolean) => void;
  setPageIndex: (page: number) => void;
  setHasNextPage: (hasNextPage: boolean) => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (response: GeneralListResponse<TData>) => void;
  fetchData: (params: FetcherParams<TData, TFilter>) => Promise<GeneralListResponse<TData>>;
  fetchNextPage: (params: FetcherParams<TData, TFilter>) => Promise<GeneralListResponse<TData>>;
  setIsRefreshing: (refreshing: boolean) => void;
  refreshPage: (params: FetcherParams<TData, TFilter>) => Promise<GeneralListResponse<TData>>;
  fetchExactPage: (params: FetcherExactPageParams<TData, TFilter>) => Promise<GeneralListResponse<TData>>;
  setIsFetchingExactPage: (fetching: boolean) => void;
  removeItemById: (id: string) => void;
  setIsFetchingNextPage: (fetching: boolean) => void;
}

export type QueryStore<TData, TFilter> = QueryState<TData, TFilter> & QueryActions<TData, TFilter>;

/* Setting the default state of the query store. */
export const defaultQueryState: QueryState<TData, TFilter> = {
  data: [],
  isLoaded: false,
  isLoading: true,
  hasNextPage: false,
  isRefreshing: false,
  isFetchingExactPage: false,
  filter: {},
  pageIndex: 1,
  pageSize: 20,
  isFetchingNextPage: false,
};

export const queryStateCreator: StateCreator<QueryStore<TData, TFilter>> = (set, get) => ({
  ...defaultQueryState,
  /* A function that takes in a filter and sets the filter to a new object. */
  setFilter: (f: TFilter) => {
    set((prev) => ({ filter: { ...prev.filter, ...f } }));
  },
  /* A function that is used to set the state of the `data` property. */
  setData: (data: TData[]) => {
    set({ data: [...data] });
  },
  /* Setting the state of the `isLoaded` property. */
  setLoaded: (isLoaded) => {
    set({ isLoaded });
  },
  /* A function that is used to set the state of the `isLoading` property. */
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  /* A function that is used to set the state of the `pageIndex` property. */
  setPageIndex: (page) => {
    set({ pageIndex: page });
  },
  /* A function that is used to set the state of the `hasNextPage` property. */
  setHasNextPage: (hasNextPage) => {
    set({ hasNextPage });
  },
  /* A function that is used to set the state of the `isRefreshing` property. */
  setIsRefreshing: (refreshing) => {
    set({ isRefreshing: refreshing });
  },
  /* This is a function that is used to set the state of the `isFetchingExactPage` property. */
  setIsFetchingExactPage: (fetching) => {
    set({ isFetchingExactPage: fetching });
  },
  /* This is a function that is used to set the state of the `isFetchingNextPage` property. */
  setIsFetchingNextPage: (fetching) => {
    set({ isFetchingNextPage: fetching });
  },
  /* A function that is used to fetch data from the server. */
  fetchData: async ({ fetcher, fetchDataSuccess, fetchDataError }: FetcherParams<TData, TFilter>) => {
    const { setLoaded, setLoading, filter, pageSize, setPageIndex, setData, setHasNextPage, onSuccess, onError } =
      get();
    let response: GeneralListResponse<TData> = defaultResponse;
    try {
      unstable_batchedUpdates(() => {
        setData([]);
        setLoading(true);
        setPageIndex(1);
      });
      response = await fetcher(filter, { pageIndex: 1, pageSize });
      const { data: dataResponse = [], total = 0 } = response;
      const updatedData = dataResponse.map((i: TData) => ({ ...i, belongToPage: 1 }));
      setData(updatedData);
      setHasNextPage(dataResponse.length < total || dataResponse.length === pageSize);
      handleQuerySuccess({ onSuccess, fetchDataSuccess, response });
    } catch (error) {
      handleQueryError({ error, onError, fetchDataError });
    } finally {
      unstable_batchedUpdates(() => {
        setLoading(false);
        setLoaded(true);
      });
    }
    return response;
  },
  /* Fetching the next page of data. */
  fetchNextPage: async ({ fetchDataError, fetchDataSuccess, fetcher }: FetcherParams<TData, TFilter>) => {
    const {
      setHasNextPage,
      pageIndex,
      setData,
      setLoading,
      setPageIndex,
      filter,
      pageSize,
      data,
      onError,
      onSuccess,
      setIsFetchingNextPage,
    } = get();
    let response: GeneralListResponse<TData> = defaultResponse;
    let nextPage = pageIndex + 1;
    try {
      setLoading(true);
      setIsFetchingNextPage(true);
      response = await fetcher(filter, { pageIndex: nextPage, pageSize });
      const { data: dataResponse = [], total = 0, pageIndex: pageIndexResponse } = response;
      const formattedMoreData = dataResponse.map((i) => ({ ...i, belongToPage: pageIndexResponse }));
      const newData = findDifferenceItems<TData>(formattedMoreData, data, (newItem, oldItem) =>
        isEqual(newItem?.id, oldItem?.id)
      );
      const concatData = [...data, ...newData];
      setData(concatData);
      setHasNextPage(concatData.length < total || dataResponse.length === pageSize);
      handleQuerySuccess({ fetchDataSuccess, response, onSuccess });
    } catch (error) {
      // shouldn't increase page index when fetching data fail
      nextPage = pageIndex;
      handleQueryError({ fetchDataError, error, onError });
    } finally {
      setPageIndex(nextPage);
      setLoading(false);
      setIsFetchingNextPage(false);
    }
    return response;
  },
  /* A function that is used to refresh the page. */
  refreshPage: async ({ fetcher, fetchDataSuccess, fetchDataError }: FetcherParams<TData, TFilter>) => {
    const { setIsRefreshing, data, filter, setData, onSuccess, onError } = get();
    let response: GeneralListResponse<TData> = defaultResponse;
    try {
      setIsRefreshing(true);
      response = await fetcher(filter, { pageIndex: 1, pageSize: 50 });
      const { data: dataResponse = [] } = response;
      const dataMappingItemToPage = dataResponse.map((i) => ({ ...i, belongToPage: 1 }));
      const dataResource = findDifferenceItems(dataMappingItemToPage, data, (newItem, oldItem) =>
        isEqual(newItem?.id, oldItem?.id)
      );
      const concatData = [...dataResource, ...data];
      setData(concatData);
      handleQuerySuccess({ response, onSuccess, fetchDataSuccess });
    } catch (error) {
      handleQueryError({ error, fetchDataError, onError });
    } finally {
      setIsRefreshing(false);
    }
    return response;
  },
  /* Fetching a page of data from the server. */
  fetchExactPage: async ({ fetcher, fetchDataSuccess, fetchDataError, page }) => {
    const { setIsFetchingExactPage, filter, pageSize, setHasNextPage, setData, data, onSuccess, onError } = get();
    let response: GeneralListResponse<TData> = defaultResponse;
    try {
      setIsFetchingExactPage(true);
      response = await fetcher(filter, { pageIndex: page, pageSize });
      const { data: dataResponse = [], total = 0 } = response;
      const updatedData = dataResponse.map((i) => ({ ...i, belongToPage: page }));
      const firstRange = data.slice(0, page * pageSize - pageSize);
      const thirdRange = data.slice(page * pageSize, data.length);
      const concatData = uniqBy([...firstRange, ...updatedData, ...thirdRange], (i: TData) => i?.id);
      setData(concatData);
      setHasNextPage(concatData.length < total || dataResponse.length === pageSize);
      handleQuerySuccess({ fetchDataSuccess, response, onSuccess });
    } catch (error) {
      handleQueryError({ fetchDataError, onError, error });
    } finally {
      setIsFetchingExactPage(false);
    }
    return response;
  },
  /* Removing an item from the data array. */
  removeItemById: (id: string) => {
    const { data, setData } = get();
    setData([...data].filter((i: TData) => i?.id !== id));
  },
  /* A function that takes in a filter and sets the filter to a new object. */
  resetFilter: (f) => {
    set({ filter: Object.assign({}, f) });
  },
  /* This is a callback function that is called when the `fetchData` function is successful. */
  onSuccess: (response) => {
    console.info('Callback handle response');
  },
  /* This is a callback function that is called when the `fetchData` function is successful. */
  onError: (error) => {
    console.error('Callback handle error');
  },
});
