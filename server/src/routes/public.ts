export default [
  { method: 'GET', path: '/forms/:slug', handler: 'public.getBySlug', config: { auth: false } },
  {
    method: 'POST',
    path: '/forms/:slug/submissions',
    handler: 'public.submit',
    config: {
      auth: false,
      middlewares: [
        {
          name: 'plugin::clever-forms.rate-limit',
          config: { windowMs: 60_000, max: 30 },
        },
      ],
    },
  },
];
