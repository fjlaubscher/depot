import useSWR from 'swr';

const fetcher = (input: URL | RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());

const useWahapedia = () => {
  const { data, error } = useSWR<Wahapedia.Data>('/wahapedia.json', fetcher);

  return {
    data,
    error,
    loading: !data && !error
  };
};

export default useWahapedia;