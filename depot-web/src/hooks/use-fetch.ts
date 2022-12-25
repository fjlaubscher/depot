import useAsync from './use-async';

const useFetch = <T>(url: string, skip = false) => {
  const {
    value: data,
    error,
    loading,
    trigger
  } = useAsync<T>(() => fetch(url).then((r) => r.json()), !skip);

  return {
    data,
    error,
    loading,
    refetch: trigger
  };
};

export default useFetch;
