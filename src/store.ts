import { UseBoundStore, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { StoreApi, Store, StateCreator, PersistOptions } from './store.typings';

export interface StoreOptions {
  storeName: string;
  enabledDevTools?: boolean;
}

export interface StorePersistedOptions<Store, StorePersisted> extends StoreOptions {
  persistOptions: PersistOptions<Store, StorePersisted>;
}

/**
 * It returns an array of middlewares that will be used to create the store
 * @param {StoreOptions}  - `storeName` - the name of the store. This is used to identify the store in
 * the Redux DevTools.
 * @returns A function that takes a function as an argument and returns a function.
 */
export const middlewareStore = ({ storeName, enabledDevTools = true }: StoreOptions) => {
  let middlewares = (fn: StateCreator<Store>) => fn;
  middlewares = (fn: StateCreator<Store>) =>
    devtools(fn, { name: storeName, enabled: enabledDevTools, anonymousActionType: `Change store [${storeName}]` });
  return [middlewares];
};

/**
 * It creates a store with a state creator and options, and returns a tuple of the store and a selector
 * function
 * @param stateCreator - This is a function that takes in the initial state and returns the store.
 * @param  - StateCreator<Store> - This is a function that takes in the initial state and returns the
 * store.
 * @returns A function that takes a stateCreator and options and returns an array of two functions.
 */
export const createStore: <Store>(
  stateCreator: StateCreator<Store>,
  options: StoreOptions
) => [UseBoundStore<StoreApi<Store>>, (store: Store) => Store] = (stateCreator, { storeName, enabledDevTools }) => {
  const [middlewares] = middlewareStore({ storeName, enabledDevTools });
  const store: UseBoundStore<StoreApi<Store>> = create<Store>(middlewares(stateCreator));
  const selector = (s: Store) => s;
  return [store, selector];
};

/**
 * It creates a store with a middleware that persists the store to localStorage
 * @param stateCreator - This is a function that returns the initial state of the store.
 * @param  - StateCreator<Store>
 * @returns A function that returns an array of two functions.
 */
export const createPersistStore: <Store, StorePersisted>(
  stateCreator: StateCreator<Store>,
  options: StorePersistedOptions<Store, StorePersisted>
) => [UseBoundStore<StoreApi<Store>>, (store: Store) => Store] = (
  stateCreator,
  { persistOptions, storeName, enabledDevTools }
) => {
  const [middlewares] = middlewareStore({ storeName, enabledDevTools });
  const store: UseBoundStore<StoreApi<Store>> = create<Store>(persist(middlewares(stateCreator), persistOptions));
  const selector = (s: Store) => s;
  return [store, selector];
};
