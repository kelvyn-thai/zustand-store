import { TData, StateCreator } from './store.typings';

export type MutationActionError = (error: Error | unknown) => void;
export type MutationActionSuccess = (response: TData) => void;

/**
 * If there's a mutationDataError function, call it, otherwise if there's an onError function, call it,
 * otherwise log the error to the console
 */
export const handleMutationError = ({
  mutationDataError,
  onError,
  error,
}: {
  error: Error | unknown;
  onError: MutationActionError;
  mutationDataError?: MutationActionError;
}): void => {
  if (typeof mutationDataError === 'function') {
    mutationDataError(error);
  } else if (typeof onError === 'function') {
    onError(error);
  } else {
    console.error(error);
  }
};

/**
 * If the mutationDataSuccess function is defined, call it with the response, otherwise call the onSuccess
 * function with the response
 * @param  - mutationDataSuccess: MutationActionSuccess;
 */
export const handleMutationSuccess = ({
  mutationDataSuccess,
  response,
  onSuccess,
}: {
  mutationDataSuccess?: MutationActionSuccess;
  response: TData;
  onSuccess: MutationActionSuccess;
}): void => {
  if (typeof mutationDataSuccess === 'function') {
    mutationDataSuccess(response);
  } else if (typeof onSuccess === 'function') {
    onSuccess(response);
  }
};

export type MutationType =
  | 'create'
  | 'edit'
  | 'delete'
  | 'submit'
  | 'publish'
  | 'save_as_draft'
  | 'deactivate'
  | 'reactivate';

export type MutationKey =
  | 'isCreating'
  | 'isEditing'
  | 'isDeleting'
  | 'isSubmitting'
  | 'isPublishing'
  | 'isSavingAsDraft'
  | 'isDeactivating'
  | 'isReactivating';

export const MutationHash: Record<MutationType, MutationKey> = {
  create: 'isCreating',
  edit: 'isEditing',
  delete: 'isDeleting',
  submit: 'isSubmitting',
  publish: 'isPublishing',
  save_as_draft: 'isSavingAsDraft',
  deactivate: 'isDeactivating',
  reactivate: 'isReactivating',
};

export interface MutationParams<Model> {
  mutationFn: () => Promise<Model>;
  mutationDataSuccess?: MutationActionSuccess;
  mutationDataError?: MutationActionError;
  mutationType?: MutationType;
  mutationKey?: string;
  customizeMutationType?: string;
}

export interface MutationState<TData> {
  data: TData;
  isLoading: boolean;
  isLoaded: boolean;
  // CRUD state
  isCreating: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  isPublishing: boolean;
  isSavingAsDraft: boolean;
  isDeactivating: boolean;
  isReactivating: boolean;
  // Mutation state by keys
  dataByKeys: MutationState<TData>[];
  mutationKey?: string;
  [key: string]: any;
}

export type MutationsOptions = {
  mutationKey?: string;
};

export type MutationStateByKey<TKey> = MutationState<any> & TKey;

export interface MutationActions<TData> {
  setData: (data: TData) => void;
  mutationData: (params: MutationParams<TData>) => Promise<TData>;
  setLoading: (isLoading: boolean, options?: MutationsOptions) => void;
  setLoaded: (isLoaded: boolean, options?: MutationsOptions) => void;
  onError: (error: Error | unknown) => void;
  onSuccess: (response: TData) => void;
  setDataByKey: (
    key: string,
    callback: (d: MutationState<TData>, index: number) => Partial<MutationState<TData>>
  ) => void;
  setMutationType: (mutationType?: MutationType, value?: boolean, options?: MutationsOptions) => void;
  setCustomizeMutationType: (customizeMutationType?: string, value?: boolean, options?: MutationsOptions) => void;
  getDataByKey: <TKey>(key: string) => MutationStateByKey<TKey>;
}

export type MutationStore<TData> = MutationState<TData> & MutationActions<TData>;

export const defaultMutationState: MutationState<TData> = {
  data: undefined,
  isLoading: false,
  isLoaded: false,
  isCreating: false,
  isEditing: false,
  isDeleting: false,
  isSubmitting: false,
  isPublishing: false,
  isSavingAsDraft: false,
  isDeactivating: false,
  isReactivating: false,
  dataByKeys: [],
  mutationKey: undefined,
};

/**
 * @deprecated This store will be deprecated in next time. Please consider use useMutation function instead of
 * It returns an object that contains the default state of the `MutationStore` and a set of functions
 * that are used to set the state of the `MutationStore`
 * @param set - This is a function that is used to set the state of the store.
 * @param get - This is a function that returns the current state of the store.
 */
export const mutationStateCreator: StateCreator<MutationStore<TData>> = (set, get) => ({
  ...defaultMutationState,
  /* It's setting the state of the `data` property. */
  setData: (data) => set({ data }),
  /* Setting the state of the `isLoaded` property. */
  setLoaded: (isLoaded, { mutationKey } = {}) => {
    const { setDataByKey } = get();
    set({ isLoaded });
    if (mutationKey) {
      setDataByKey(mutationKey, () => ({ isLoaded }));
    }
  },
  /* A function that is used to set the state of the `isLoading` property. */
  setLoading: (isLoading, { mutationKey } = {}) => {
    const { setDataByKey } = get();
    set({ isLoading });
    if (mutationKey) {
      setDataByKey(mutationKey, () => ({ isLoading }));
    }
  },
  /* It's setting the state of the `isCreating`, `isEditing`, `isDeleting`, `isSubmitting`,
 `isPublishing`, `isSavingAsDraft`, `isDeactivating`, `isReactivating` properties. */
  setMutationType: (mutationType, value, { mutationKey } = {}) => {
    if (!mutationType) {
      return;
    }
    const { setDataByKey } = get();
    set({
      [MutationHash[mutationType]]: value,
    });
    if (mutationKey) {
      setDataByKey(mutationKey, () => ({ [MutationHash[mutationType]]: value }));
    }
  },
  /* This function is used to set a custom mutation type in the `MutationState` object. It takes in a
`customizeMutationType` string, a `value` boolean, and an optional `mutationKey` string. If
`customizeMutationType` is not provided, the function returns early. Otherwise, it sets the
`customizeMutationType` property in the state object to the provided `value`. If a `mutationKey` is
provided, it also updates the state of the `dataByKeys` property using the `setDataByKey` function. */
  setCustomizeMutationType: (customizeMutationType, value, { mutationKey } = {}) => {
    if (!customizeMutationType) {
      return;
    }
    const { setDataByKey } = get();
    set({
      [customizeMutationType]: value,
    });
    if (mutationKey) {
      setDataByKey(mutationKey, () => ({ [customizeMutationType]: value }));
    }
  },
  /* `mutationData` is a function that is used to perform a mutation operation. It takes in an object
  with several parameters including `mutationDataSuccess`, `mutationDataError`, `mutationFn`,
  `mutationType`, `mutationKey`, and `customizeMutationType`. */
  mutationData: async ({
    mutationDataSuccess,
    mutationDataError,
    mutationFn,
    mutationType,
    mutationKey,
    customizeMutationType,
  }) => {
    // 'mutationKey' is really important in case you want your 'key' own mutation state.
    // Use it when you need update one or some records in table (pagination table / infinite table) without reload all records or whole page
    const { setLoaded, setLoading, onError, onSuccess, setMutationType, setCustomizeMutationType } = get();
    let response: TData;
    try {
      setLoading(true, { mutationKey });
      setMutationType(mutationType, true, { mutationKey });
      setCustomizeMutationType(customizeMutationType, true, { mutationKey });
      response = await mutationFn();
      handleMutationSuccess({ onSuccess, mutationDataSuccess, response });
    } catch (error) {
      handleMutationError({ error, mutationDataError, onError });
    } finally {
      setMutationType(mutationType, false, { mutationKey });
      setCustomizeMutationType(customizeMutationType, false, { mutationKey });
      setLoading(false, { mutationKey });
      setLoaded(true, { mutationKey });
    }
    return response;
  },
  /* This is a callback function that is called when the `mutationData` function is successful. */
  onSuccess: (response) => {
    console.info('Callback handle response', response);
  },
  /* This is a callback function that is called when the `mutationData` function is successful. */
  onError: (error) => {
    console.error('Callback handle error', error);
  },
  /* It's a function that is used to set the state of the `dataByKeys` property. */
  setDataByKey: (key: string, callback: (d: MutationState<TData>, index: number) => Partial<MutationState<TData>>) => {
    const { dataByKeys } = get();
    const foundIndex = dataByKeys.findIndex((d) => d.mutationKey === key);
    if (foundIndex === -1) {
      // not found => init state by mutation key
      set({
        dataByKeys: [
          ...dataByKeys,
          { ...defaultMutationState, mutationKey: key, ...callback(defaultMutationState, foundIndex) },
        ],
      });
    } else {
      // existed => update state by mutation key
      set({
        dataByKeys: dataByKeys.map((i: MutationState<TData>, index) =>
          index === foundIndex ? { ...i, ...callback(i, index) } : i
        ),
      });
    }
  },
  getDataByKey: <TKey>(key: string) => {
    const { dataByKeys } = get();
    return dataByKeys.find((d) => d.mutationKey === key) as unknown as MutationStateByKey<TKey>;
  },
});
