interface Fetcher {
  fetch(input: Request): Promise<Response>;
}

type D1Database = object;

type R2Bucket = object;

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    DOCUMENTS?: R2Bucket;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
  };
}
