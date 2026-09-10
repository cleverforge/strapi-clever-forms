export default ({ env }: { env: any }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET', 'fixture-admin-secret') },
  apiToken: { salt: env('API_TOKEN_SALT', 'fixture-api-token-salt') },
  transfer: { token: { salt: env('TRANSFER_TOKEN_SALT', 'fixture-transfer-salt') } },
  secrets: { encryptionKey: env('ENCRYPTION_KEY', 'fixture-encryption-key-32-bytes-000') }
});
