export default ({ env }: { env: any }) => ({
  host: env('HOST', '127.0.0.1'),
  port: env.int('PORT', 1337),
  app: { keys: env.array('APP_KEYS', ['fixtureKey1', 'fixtureKey2']) }
});
