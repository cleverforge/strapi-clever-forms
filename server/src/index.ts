import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';

const permissions = [
  'forms.read',
  'forms.create',
  'forms.update',
  'forms.delete',
  'forms.publish',
  'submissions.read',
].map((action) => ({
  section: 'plugins',
  displayName: action.replace('.', ' '),
  uid: action,
  pluginName: 'clever-forms',
}));

export default {
  async register({ strapi }: { strapi: any }) {
    await strapi.admin.services.permission.actionProvider.registerMany(permissions);
  },
  bootstrap() {},
  config: { default: {}, validator() {} },
  contentTypes,
  controllers,
  routes,
  services,
};
