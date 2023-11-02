import { renderHook, act } from '@testing-library/react-hooks';
import { useSearch } from '../store.useSearch';

const searchFnMock = jest.fn();
const onSuccessMock = jest.fn();
const onErrorMock = jest.fn();
const onResetMock = jest.fn();

describe('useSearch', () => {
  beforeEach(() => {
    searchFnMock.mockClear();
    onSuccessMock.mockClear();
    onErrorMock.mockClear();
    onResetMock.mockClear();
  });

  test('should set key search and call search function when searchAsync is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock, onError: onErrorMock })
    );
    const keySearch = 'test';
    act(() => {
      result.current.searchAsync(keySearch);
    });
    await waitForNextUpdate();
    expect(result.current.keySearch).toEqual(keySearch);
    expect(searchFnMock).toHaveBeenCalledTimes(1);
    expect(searchFnMock).toHaveBeenCalledWith(result.current.keySearch);
  });

  test('should set success state and call onSuccess when search function succeeds', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock, onError: onErrorMock })
    );
    const data = [{ foo: 'bar' }, { bar: 'zzz' }];

    const keySearch = 'test';

    searchFnMock.mockResolvedValueOnce(data);

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.searchAsync(keySearch);
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();

    await waitForNextUpdate();

    expect(searchFnMock).toHaveBeenCalledWith(result.current.keySearch);
    expect(result.current.isSuccess).toBeTruthy();
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).toHaveBeenCalledWith(data);
    expect(result.current.data).toEqual(data);
  });

  test('should set error state and call onError when search function throws an error', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock, onError: onErrorMock })
    );
    const error = new Error('Some error message');

    searchFnMock.mockRejectedValueOnce(error);

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.searchAsync('test');
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    await waitForNextUpdate();

    expect(result.current.error).toBe(error);
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledWith(error);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
  });

  test('should set loading state to true when searchAsync is called', async () => {
    const { result } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock, onError: onErrorMock })
    );
    act(() => {
      result.current.searchAsync('test');
    });
    expect(result.current.isLoading).toBeTruthy();
  });

  test('should set loading state to false after search function completes', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock, onError: onErrorMock })
    );
    searchFnMock.mockResolvedValueOnce({});
    act(() => {
      result.current.searchAsync('test');
    });
    await waitForNextUpdate();
    expect(result.current.isLoading).toBe(false);
  });

  test('should call the searchFn with the trimmed keySearch and set the success state when the search is successful', async () => {
    const keySearch = '  example  ';
    const expectedData = { example: 'data' };

    searchFnMock.mockResolvedValue(expectedData);

    const { result, waitForNextUpdate } = renderHook(() =>
      useSearch({ searchFn: searchFnMock, onSuccess: onSuccessMock })
    );

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.searchAsync).toBeInstanceOf(Function);

    act(() => {
      result.current.searchAsync(keySearch);
    });

    expect(result.current.isLoading).toBeTruthy();

    await waitForNextUpdate();

    expect(searchFnMock).toHaveBeenCalledWith('example');
    expect(result.current.isSuccess).toBeTruthy();
    expect(onSuccessMock).toHaveBeenCalledWith(expectedData);
    expect(result.current.isLoading).toBeFalsy();
  });
});
