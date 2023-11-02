import { renderHook, act } from '@testing-library/react-hooks';
import { useMutation } from '../store.useMutation';

describe('useMutation', () => {
  const mockMutationFn = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockMutationFn.mockReset();
    mockOnSuccess.mockReset();
    mockOnError.mockReset();
  });

  test('should call mutationFn with payload when mutateAsync is called', async () => {
    const payload = { foo: 'bar' };
    const response = { id: 1, ...payload };
    mockMutationFn.mockResolvedValue(response);

    const { result, waitForNextUpdate } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      })
    );

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.mutateAsync(payload);
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(mockMutationFn).toHaveBeenCalledWith(payload);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeTruthy();
    expect(result.current.data).toMatchObject(response);
  });

  test('should set success and call onSuccess callback when mutationFn resolves successfully', async () => {
    const payload = { foo: 'bar' };
    const successData = { id: 123, name: 'John' };
    mockMutationFn.mockResolvedValue(successData);

    const { result, waitForNextUpdate } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      })
    );
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.mutateAsync(payload);
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(mockMutationFn).toHaveBeenCalledWith(payload);

    await waitForNextUpdate();

    expect(result.current.isError).toBeFalsy();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeTruthy();
    expect(mockOnSuccess).toHaveBeenCalledWith(successData);
    expect(result.current.data).toMatchObject(successData);
  });

  test('should set error and call onError callback when mutationFn throws an error', async () => {
    const payload = { foo: 'bar' };
    const error = new Error('Some error');
    mockMutationFn.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() =>
      useMutation({
        mutationFn: mockMutationFn,
        onSuccess: mockOnSuccess,
        onError: mockOnError,
      })
    );

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.mutateAsync(payload);
    });

    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(mockMutationFn).toHaveBeenCalledWith(payload);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toEqual(error);
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(mockOnError).toHaveBeenCalledWith(error);
  });
});
