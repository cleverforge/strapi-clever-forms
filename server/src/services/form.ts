export default ({ strapi }: { strapi: any }) => ({
  async findPublishedBySlug(slug: string) {
    const results = await strapi.documents('plugin::clever-forms.form').findMany({
      filters: { slug, status: 'published' },
      status: 'published',
      limit: 1,
    });
    return results?.[0] ?? null;
  },
});
