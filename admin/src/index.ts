import type { StrapiApp } from '@strapi/strapi/admin';
import { cleverFormsExtensions } from './extensions/registry.js';

export const PLUGIN_ID = 'clever-forms';
export { cleverFormsExtensions } from './extensions/registry.js';
export type { CleverFieldDefinition, CleverSettingsPanel, CleverFormAction } from './extensions/registry.js';

const CleverFormsIcon = () => null;

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: CleverFormsIcon,
      intlLabel: { id: `${PLUGIN_ID}.plugin.name`, defaultMessage: 'CleverForms' },
      Component: async () => {
        const module = await import('./pages/App.js');
        return { default: module.default };
      },
      permissions: [],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'CleverForms',
      apis: { extensions: cleverFormsExtensions },
    });
  },

  bootstrap() {},

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },
};
