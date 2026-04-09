type SchemaLike<T> = {
  parse(value: unknown): T;
};

type FetchValidatedJsonOptions<T> = {
  fetcher?: typeof fetch;
  init?: RequestInit;
  input: RequestInfo | URL;
  schema: SchemaLike<T>;
};

type ErrorPayload = {
  message?: string;
};

export async function fetchValidatedJson<T>({
  fetcher = fetch,
  init,
  input,
  schema,
}: FetchValidatedJsonOptions<T>): Promise<T> {
  const response = await fetcher(input, init);
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload;
    throw new Error(errorPayload.message ?? `Request failed with status ${response.status}`);
  }

  return schema.parse(payload);
}
