export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'development-admin-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'development-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'development-transfer-token-salt'),
    },
  },
})
