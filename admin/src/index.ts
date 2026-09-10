import { cleverFormsExtensions } from './extensions/registry';

export const PLUGIN_ID = 'clever-forms';
export { cleverFormsExtensions } from './extensions/registry';
export type { CleverFieldDefinition, CleverSettingsPanel, CleverFormAction } from './extensions/registry';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: () => null,
      intlLabel: { id: `${PLUGIN_ID}.plugin.name`, defaultMessage: 'CleverForms' },
      Component: async () => import('./pages/App'),
      permissions: [],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'CleverForms',
      apis: {
        extensions: cleverFormsExtensions,
      },
    });
  },
  bootstrap() {},
  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
    return importedTrads;
  },
};
