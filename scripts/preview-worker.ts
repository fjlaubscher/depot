import { onRequest } from '../functions/[[path]].ts';

type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return onRequest({ request, env });
  }
};
