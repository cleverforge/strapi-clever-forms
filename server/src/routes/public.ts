export default [
  { method: 'GET', path: '/forms/:slug', handler: 'public.getBySlug', config: { auth: false } },
  { method: 'POST', path: '/forms/:slug/submissions', handler: 'public.submit', config: { auth: false } },
];
