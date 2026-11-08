import {
  router,
  json,
  error,
  requireAuth,
  requireAdminEmailAllowlist,
  db,
  storage,
} from '@appdeploy/sdk';

const ADMIN_EMAILS = ['adumaxwell298@gmail.com'];
const TABLE = 'portfolio_projects';
const admin = [requireAuth(), requireAdminEmailAllowlist(ADMIN_EMAILS)];

export const handler = router({
  'GET /api/projects': [
    async () => {
      const result = await db.list(TABLE, { limit: 50 });
      const projects = await Promise.all(
        result.items.map(async p => {
          if (!p.imagePath) return p;
          const [file] = await storage.url([String(p.imagePath)]);
          return { ...p, imageUrl: file?.url || '' };
        })
      );
      return json({ projects });
    },
  ],
  'POST /api/projects': [
    ...admin,
    async ({ body }) => {
      const data = body as {
        title?: string;
        description?: string;
        category?: string;
        url?: string;
        imageUrl?: string;
      };
      if (!data.title?.trim() || !data.description?.trim() || !data.url?.trim())
        return error('Title, description and live app URL are required.', 400);
      if (!/^https:\/\//i.test(data.url))
        return error('Use a secure https:// app link.', 400);
      const [id] = await db.add(TABLE, [
        {
          title: data.title.trim().slice(0, 100),
          description: data.description.trim().slice(0, 600),
          category: (data.category || 'Other').slice(0, 40),
          url: data.url.trim(),
          imageUrl: '',
          imagePath: '',
          createdAt: new Date().toISOString(),
        },
      ]);
      if (!id) return error('Project could not be saved.', 500);
      return json({ id });
    },
  ],
  'PUT /api/projects/:id': [
    ...admin,
    async ({ params, body }) => {
      const data = body as {
        title?: string;
        description?: string;
        category?: string;
        url?: string;
      };
      if (
        !data.title?.trim() ||
        !data.description?.trim() ||
        !data.url?.trim() ||
        !/^https:\/\//i.test(data.url)
      )
        return error(
          'Enter a title, description and secure https app URL.',
          400
        );
      const [old] = await db.get<Record<string, unknown>>(TABLE, [params.id]);
      if (!old) return error('Project not found.', 404);
      const [ok] = await db.update(TABLE, [
        {
          id: params.id,
          record: {
            ...old,
            title: data.title.trim().slice(0, 100),
            description: data.description.trim().slice(0, 600),
            category: (data.category || 'Other').slice(0, 40),
            url: data.url.trim(),
          },
        },
      ]);
      return ok
        ? json({ updated: true })
        : error('Project could not be updated.', 500);
    },
  ],
  'POST /api/projects/:id/image': [
    ...admin,
    async ({ params, body }) => {
      const data = body as { base64?: string; contentType?: string };
      const allowed = ['image/png', 'image/jpeg', 'image/webp'];
      if (
        !data.base64 ||
        !data.contentType ||
        !allowed.includes(data.contentType)
      )
        return error('Choose a PNG, JPG or WebP image.', 400);
      if (data.base64.length > 4_200_000)
        return error('Image is too large. Maximum size is 3 MB.', 413);
      const [project] = await db.get<Record<string, unknown>>(TABLE, [
        params.id,
      ]);
      if (!project) return error('Project not found.', 404);
      const path = 'portfolio-covers/' + params.id + '-' + Date.now();
      const [ok] = await storage.write([
        { path, content: data.base64, contentType: data.contentType },
      ]);
      if (!ok) return error('Image upload failed.', 500);
      const [saved] = await db.update(TABLE, [
        { id: params.id, record: { ...project, imagePath: path } },
      ]);
      if (!saved)
        return error(
          'Image uploaded but project could not be updated. Please retry.',
          500
        );
      return json({ uploaded: true });
    },
  ],
  'DELETE /api/projects/:id': [
    ...admin,
    async ({ params }) => {
      const [project] = await db.get<Record<string, unknown>>(TABLE, [
        params.id,
      ]);
      if (!project) return error('Project not found.', 404);
      const [ok] = await db.delete(TABLE, [params.id]);
      if (ok && typeof project.imagePath === 'string' && project.imagePath)
        await storage.delete([project.imagePath]);
      return ok
        ? json({ deleted: true })
        : error('Project could not be removed.', 500);
    },
  ],
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
});
