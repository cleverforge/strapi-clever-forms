export default ({ strapi }: { strapi: any }) => ({
  async findPublishedBySlug(slug: string) {
    const results = await strapi.documents('plugin::clever-forms.form').findMany({
      filters: { slug, lifecycle: 'active' },
      status: 'published',
      limit: 1,
    });

    return results?.[0] ?? null;
  },
});
