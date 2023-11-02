import { shallow } from 'zustand/shallow';
import { createStore } from './store';
import { useEffect } from 'react';

export type MutationStateError = Error | unknown | any;
export type MutationStateData = any;

export type MutationState = {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: MutationStateError;
  data: MutationStateData;
};

export type MutationAction = (payload?: any) => Promise<any>;
export type MutationActionError = (error: MutationStateError) => void;
export type MutationActionSuccess = (data: MutationStateData) => void;

export type MutationActions = {
  setLoading: (isLoading: boolean) => void;
  setError: MutationActionError;
  setSuccess: MutationActionSuccess;
  resetStore: () => void;
};

export type MutationStore = MutationState & MutationActions;

export type UseMutationHook = MutationStore & {
  mutateAsync: (payload?: any) => Promise<any>;
};

export const initializedState: MutationState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: undefined,
  data: undefined,
};

const [useMutationStore, selector] = createStore<MutationStore>(
  (set) => ({
    ...initializedState,
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: MutationStateError) => set({ isError: !!error, error }),
    setSuccess: (data: MutationStateData) => set({ isSuccess: !!data, data }),
    resetStore: () => set({ ...initializedState }),
  }),
  {
    storeName: Symbol('$MUTATION_STORE').toString(),
  }
);

/**
 * The code defines a function called useMutation which is used as a custom hook for handling mutation operations.
 * Reference: https://tanstack.com/query/latest/docs/react/guides/mutations
 * The function takes an object as an argument with the following properties:
 * - mutationFn: A function that performs the mutation operation and returns a promise or any value.
 * - onSuccess: An optional callback function that will be called if the mutation is successful.
 * - onError: An optional callback function that will be called if the mutation encounters an error.
 * The function returns an object that includes the following properties and methods:
 * - store: An object that contains the state of the mutation operation, including loading, error, and success properties.
 * - mutate: A synchronous function that performs the mutation operation. It sets the loading state to true, clears any previous error or success state, calls the mutationFn function, sets the success state with the returned data, and calls the onSuccess callback if provided. If an error occurs, it sets the error state and calls the onError callback if provided. Finally, it sets the loading state to false and returns the data.
 * - mutateAsync: An asynchronous function that performs the mutation operation. It follows the same logic as the mutate function, but awaits the mutationFn function call and returns a promise with the data.
 * Overall, the code provides a convenient way to handle mutation operations by encapsulating the state management and error handling logic.
 */
export const useMutation = ({
  mutationFn,
  onSuccess,
  onError,
}: {
  mutationFn: (payload?: any) => Promise<any>;
  onSuccess?: MutationActionSuccess;
  onError?: MutationActionError;
}): UseMutationHook => {
  const store = useMutationStore(selector, shallow);
  const { setLoading, setError, setSuccess, resetStore } = store;
  const mutateAsync = async (payload?: any): Promise<any> => {
    let data: any;
    try {
      setLoading(true);
      data = await mutationFn(payload);
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
  return { ...store, mutateAsync };
};
