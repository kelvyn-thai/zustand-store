import { GeneralListResponse } from 'src/models/response/GeneralList.response';
import { defaultResponse } from './store.constants';
import { handleQueryError, handleQuerySuccess, QueryActionError, QueryActionSuccess } from './store.query';
import { TData, StateCreator, TFilter } from './store.typings';

export type Fetcher<TData, TFilter> = (filter: TFilter) => Promise<GeneralListResponse<TData>>;
export interface FetcherParams<TData, TFilter> {
  fetcher: Fetcher<TData, TFilter>;
  fetchDataSuccess?: QueryActionSuccess;
  fetchDataError?: QueryActionError;
}
export interface QueryState<TData, TFilter> {
  filter: TFilter;
  data: TData[];
  isLoading: boolean;
  isLoaded: boolean;
  total: number;
}

export interface QueryActions<TData, TFilter> {
  setFilter: (f: TFilter) => void;
  setData: (data: TData[]) => void;
  fetchData: (params: FetcherParams<TData, TFilter>) => Promise<TData>;
  setLoading: (isLoading: boolean) => void;
  setLoaded: (isLoaded: boolean) => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (response: TData) => void;
  setTotalItems: (totalItems: number) => void;
}

export type QueryStore<TData, TFilter> = QueryState<TData, TFilter> & QueryActions<TData, TFilter>;

export const defaultQueryState: QueryState<TData, TFilter> = {
  data: [],
  filter: {
    pageIndex: 1,
  },
  isLoading: true,
  isLoaded: false,
  total: 0,
};

export const queryStateCreator: StateCreator<QueryStore<TData, TFilter>> = (set, get) => ({
  ...defaultQueryState,
  /* Setting the state of the `total` property. */
  setTotalItems: (totalItems) => set({ total: totalItems }),
  /* Using the `set` function to set the state of the `filter` property. */
  setFilter: (f: TFilter) => set((prev) => ({ filter: { ...prev.filter, ...f } })),
  /* Setting the state of the `data` property. */
  setData: (data) => set({ data }),
  /* Setting the state of the `isLoaded` property. */
  setLoaded: (isLoaded) => set({ isLoaded }),
  /* A function that is used to set the state of the `isLoading` property. */
  setLoading: (isLoading) => set({ isLoading }),
  /* A function that is used to fetch data from the server. */
  fetchData: async ({ fetchDataSuccess, fetchDataError, fetcher }) => {
    const { setLoaded, setLoading, setData, onError, onSuccess, filter, setTotalItems } = get();
    let response: GeneralListResponse<TData> = defaultResponse;
    try {
      setLoading(true);
      response = await fetcher(filter);
      const { data = [], total = 0 } = response;
      setData(data);
      setTotalItems(total);
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
  onSuccess: (response) => {
    console.info('Callback handle response');
  },
  /* This is a callback function that is called when the `fetchData` function is successful. */
  onError: (error) => {
    console.error('Callback handle error');
  },
});
