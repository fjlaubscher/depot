const fetcher = (input: URL | RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());

export default fetcher;
