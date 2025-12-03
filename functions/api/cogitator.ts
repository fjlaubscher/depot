import type { WorkerEnv } from '@depot/workers';
import { handleCogitatorRequest } from '@depot/workers';

type CogitatorContext = {
  request: Request;
  env: WorkerEnv;
};

export const onRequestPost = ({ request, env }: CogitatorContext) =>
  handleCogitatorRequest(request, env);
