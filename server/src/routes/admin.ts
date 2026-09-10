export default [
  { method: 'GET', path: '/forms', handler: 'admin.list', config: { policies: [] } },
  { method: 'GET', path: '/forms/:documentId', handler: 'admin.findOne', config: { policies: [] } },
  { method: 'POST', path: '/forms', handler: 'admin.create', config: { policies: [] } },
  { method: 'PUT', path: '/forms/:documentId', handler: 'admin.update', config: { policies: [] } },
  { method: 'POST', path: '/forms/:documentId/publish', handler: 'admin.publish', config: { policies: [] } },
  { method: 'DELETE', path: '/forms/:documentId', handler: 'admin.remove', config: { policies: [] } },
  { method: 'GET', path: '/submissions', handler: 'admin.listSubmissions', config: { policies: [] } },
];
