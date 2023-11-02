/* eslint-disable @typescript-eslint/no-explicit-any */
export type Store = any;
export type T = any;
export type TData = any;
export type TFilter = any;
export type SetStateInternal<T> = {
  _: (
    partial:
      | T
      | Partial<T>
      | {
          _: (state: T) => T | Partial<T>;
        }['_'],
    replace?: boolean | undefined
  ) => void;
}['_'];
export type GetStateInternal<T> = () => T;
export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: GetStateInternal<T>;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  destroy: () => void;
}

export type StateCreator<T> = (
  setState: SetStateInternal<T>,
  getState: GetStateInternal<T>,
  storeApi: StoreApi<T>
) => T;

export interface PersistOptions<S, PersistedState = S> {
  /** Name of the storage (must be unique) */
  name: string;
  partialize?: (state: S) => PersistedState;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => S | Promise<S>;
  merge?: (persistedState: unknown, currentState: S) => S;
}
