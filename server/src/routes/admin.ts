const permission = (action: string) => ({
  policies: [{ name: 'admin::hasPermissions', config: { actions: [`plugin::clever-forms.${action}`] } }],
});

export default [
  { method: 'GET', path: '/forms', handler: 'admin.list', config: permission('forms.read') },
  { method: 'GET', path: '/forms/:documentId', handler: 'admin.findOne', config: permission('forms.read') },
  { method: 'POST', path: '/forms', handler: 'admin.create', config: permission('forms.create') },
  { method: 'POST', path: '/forms/:documentId/duplicate', handler: 'admin.duplicate', config: permission('forms.create') },
  { method: 'PUT', path: '/forms/:documentId', handler: 'admin.update', config: permission('forms.update') },
  { method: 'POST', path: '/forms/:documentId/publish', handler: 'admin.publish', config: permission('forms.publish') },
  { method: 'PUT', path: '/forms/:documentId/lifecycle', handler: 'admin.setLifecycle', config: permission('forms.update') },
  { method: 'DELETE', path: '/forms/:documentId', handler: 'admin.remove', config: permission('forms.delete') },
  { method: 'GET', path: '/submissions', handler: 'admin.listSubmissions', config: permission('submissions.read') },
  { method: 'GET', path: '/submissions/:documentId', handler: 'admin.findSubmission', config: permission('submissions.read') },
  { method: 'PUT', path: '/submissions/:documentId/status', handler: 'admin.updateSubmissionStatus', config: permission('submissions.read') },
];
