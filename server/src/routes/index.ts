import publicRoutes from './public';
import adminRoutes from './admin';

export default {
  'content-api': { type: 'content-api', routes: publicRoutes },
  admin: { type: 'admin', routes: adminRoutes },
};
