## Kernel Notes

Medium-like IT publication built with Next.js and WordPress headless CMS.

### Stack
- Next.js App Router + TypeScript
- WordPress + WPGraphQL (headless CMS)
- Tailwind CSS v4 + custom editorial CSS
- Dark mode via next-themes
- Algolia for search experience

### Run Locally
1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Configure env values in `.env.local`:
- `WORDPRESS_GRAPHQL_URL`
- `WORDPRESS_REST_URL` (optional if inferred from GraphQL URL)
- `WORDPRESS_PREVIEW_SECRET`
- `WORDPRESS_REVALIDATE_SECRET`
- `WORDPRESS_ADMIN_USERNAME`
- `WORDPRESS_APPLICATION_PASSWORD`
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`

4. Start development server:

```bash
npm run dev
```

If `WORDPRESS_GRAPHQL_URL` is missing, the app automatically runs with local sample articles so UI development can continue.

### WordPress Requirements
Install and configure these plugins in WordPress:
- WPGraphQL
- Advanced Custom Fields (optional but recommended)
- SEO plugin (Yoast or Rank Math)
- JWT or application-password based preview flow
- Algolia integration plugin for indexing publish/update/delete events

For post CRUD, create an Application Password in WordPress:
1. Open Users > Profile in wp-admin.
2. In Application Passwords, create a new password for this Next.js app.
3. Put your username in `WORDPRESS_ADMIN_USERNAME`.
4. Put the generated password in `WORDPRESS_APPLICATION_PASSWORD`.

### Current Routes
- `/` home feed
- `/articles/[slug]` article detail
- `/categories/[slug]` category listing
- `/authors/[slug]` author listing
- `/search` Algolia-backed search UI
- `/studio/posts` post CRUD dashboard
- `/sitemap.xml` generated from articles/categories/authors
- `/robots.txt` with API routes excluded

### CMS Integration Endpoints
- `GET /api/preview?secret=...&slug=...` enables draft mode and opens an article route.
- `GET /api/preview/exit` disables draft mode and redirects to `/` by default.
- `GET|POST /api/revalidate?secret=...` revalidates WordPress cache tag and optional page paths.
- `GET /api/posts` lists posts from WordPress.
- `POST /api/posts` creates a new post.
- `GET /api/posts/[id]` gets one post for editing.
- `PATCH /api/posts/[id]` updates a post.
- `DELETE /api/posts/[id]` deletes a post permanently.

Example revalidate payload:

```json
{
	"secret": "replace-with-your-secret",
	"tag": "wp-content",
	"paths": ["/", "/categories/engineering"]
}
```

### Quality Checks
```bash
npm run lint
```

### Deployment Notes
- Frontend: Vercel
- CMS: Managed WordPress host
- Revalidation: WordPress webhook -> `POST /api/revalidate`
- Search freshness: WordPress publish hooks -> Algolia indexing

### Next Milestones
- WordPress-side preview URL wiring and auth hardening
- Webhook payload standardization and signature verification
- Full SEO metadata wiring from CMS fields
