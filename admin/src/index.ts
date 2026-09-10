import type { StrapiApp } from '@strapi/strapi/admin';
import { PuzzlePiece } from '@strapi/icons';

export const PLUGIN_ID = 'clever-forms';

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PuzzlePiece,
      intlLabel: { id: `${PLUGIN_ID}.plugin.name`, defaultMessage: 'CleverForms' },
      Component: async () => import('./pages/App'),
      permissions: [],
    });

    app.registerPlugin({ id: PLUGIN_ID, name: 'CleverForms' });
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
