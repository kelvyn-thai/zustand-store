import { shallow } from 'zustand/shallow';
import { createStore } from './store';
import { useEffect } from 'react';
import trim from 'lodash/trim';

export type SearchStateError = Error | unknown | any;
export type SearchStateData = any;

export type SearchState = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: SearchStateError;
  data: SearchStateData;
  keySearch: string;
};

export type SearchAction = (keySearch: string) => Promise<any>;
export type SearchActionError = (error: SearchStateError) => void;
export type SearchActionSuccess = (data: SearchStateData) => void;

export type SearchActions = {
  setLoading: (isLoading: boolean) => void;
  setError: SearchActionError;
  setSuccess: SearchActionSuccess;
  resetStore: () => void;
  setKeySearch: (keySearch: string) => void;
  setData: (data: any) => void;
};

export type SearchStore = SearchState & SearchActions;

export type UseSearchHook = SearchStore & {
  searchAsync: (keySearch: string) => Promise<any>;
};

export const initializedState: SearchState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: undefined,
  data: undefined,
  keySearch: '',
};

const [useStore, selector] = createStore<SearchStore>(
  (set) => ({
    ...initializedState,
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: SearchStateError) => set({ isError: !!error, error }),
    setSuccess: (data: SearchStateData) => set({ isSuccess: !!data, data }),
    resetStore: () => set({ ...initializedState }),
    setKeySearch: (keySearch: string) => set({ keySearch }),
    setData: (data: any) => set({ data }),
  }),
  {
    storeName: Symbol('$SEARCH_STORE').toString(),
  }
);

export const useSearchStore = (): SearchStore => useStore(selector, shallow);

export const useSearch = ({
  searchFn,
  onSuccess,
  onError,
}: {
  searchFn: (keySearch: string) => Promise<any>;
  onSuccess?: SearchActionSuccess;
  onError?: SearchActionError;
}): UseSearchHook => {
  const store = useSearchStore();
  const { setLoading, setError, setSuccess, resetStore, setKeySearch, setData } = store;
  const searchAsync = async (keySearch: string): Promise<any> => {
    let data: any;
    try {
      const keySearchTrimmed = trim(keySearch);
      setKeySearch(keySearchTrimmed);
      if (!keySearchTrimmed) {
        setData(undefined);
        return;
      }
      setLoading(true);
      data = await searchFn(keySearchTrimmed);
      setSuccess(data);
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
    } catch (error) {
      setError(error);
      if (typeof onError === 'function') {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
    return data;
  };
  useEffect(() => {
    resetStore();
    return () => {
      resetStore();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ...store, searchAsync };
};
