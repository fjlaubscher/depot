export interface WorkerEnv {
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
}

export type ErrorResult = {
  error: string;
};

export type JsonResult<T> = Response;
