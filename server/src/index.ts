import contentTypes from './content-types';
import controllers from './controllers';
import routes from './routes';
import services from './services';

export default {
  register() {},
  bootstrap() {},
  config: { default: {}, validator() {} },
  contentTypes,
  controllers,
  routes,
  services,
};
