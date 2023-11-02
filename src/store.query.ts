import { GeneralListResponse } from 'src/models/response/GeneralList.response';
import { TData } from './store.typings';

export type QueryActionError = (error: Error | unknown) => void;
export type QueryActionSuccess = (response: GeneralListResponse<TData> | TData) => void;

/**
 * If there's a fetchDataError function, call it, otherwise if there's an onError function, call it,
 * otherwise log the error to the console
 */
export const handleQueryError = ({
  fetchDataError,
  onError,
  error,
}: {
  error: Error | unknown;
  onError: QueryActionError;
  fetchDataError?: QueryActionError;
}): void => {
  if (typeof fetchDataError === 'function') {
    fetchDataError(error);
  } else if (typeof onError === 'function') {
    onError(error);
  } else {
    console.error(error);
  }
};

/**
 * If the fetchDataSuccess function is defined, call it with the response, otherwise call the onSuccess
 * function with the response
 * @param  - fetchDataSuccess: QueryActionSuccess;
 */
export const handleQuerySuccess = ({
  fetchDataSuccess,
  response,
  onSuccess,
}: {
  fetchDataSuccess?: QueryActionSuccess;
  response: GeneralListResponse<TData> | TData;
  onSuccess: QueryActionSuccess;
}): void => {
  if (typeof fetchDataSuccess === 'function') {
    fetchDataSuccess(response);
  } else if (typeof onSuccess === 'function') {
    onSuccess(response);
  }
};
