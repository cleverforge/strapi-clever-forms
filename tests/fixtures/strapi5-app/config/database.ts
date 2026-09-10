import path from 'node:path';

export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', path.join(process.cwd(), '.tmp/data.db'))
    },
    useNullAsDefault: true
  }
});
