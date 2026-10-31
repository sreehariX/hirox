# Deploy Hirox

1. In [Vercel New Project](https://vercel.com/new), import **sreehariX/hirox**, branch **main**.
2. Use the **Next.js** framework preset, repository root, and the default install/build settings. Build command: `npm run build`. Node.js: **24.x**.
3. Import the private **`.env.vercel.local`** file into Vercel's Environment Variables section. It contains exactly the seven values below and is excluded from Git. Apply them to **Production** (and Preview if you want preview deployments to work):

   | Name | Value |
   | --- | --- |
   | `CRUSTDATA_API_KEY` | Existing Crustdata key |
   | `OPENAI_API_KEY` | Existing OpenAI key |
   | `FIRECRAWL_API_KEY` | Existing Firecrawl key |
   | `OPENAI_MODEL` | `gpt-5-mini` |
   | `SUPABASE_URL` | Existing project URL |
   | `SUPABASE_SECRET_KEY` | Existing server secret key |
   | `HIROX_STORAGE` | `supabase` |

4. Keep **Enable access to System Environment Variables** enabled in **Settings → Environment Variables**. Workflow uses Vercel's deployment ID to select its hosted runtime. Keep **Fluid Compute** enabled under **Settings → Functions**. New Vercel projects normally enable it already.
5. Deploy. If either setting needed changing after the first deployment, redeploy once.

The database tables already exist. Do not run database setup again. Do not add `SUPABASE_DB_URL`, `HIROX_ACCESS_PASSWORD`, a `NEXT_PUBLIC_` prefix, or a manual `WORKFLOW_TARGET_WORLD` setting. Keys stay on the server. Hirox opens without a workspace password for this demo.

## After the deployment is ready

Open the production URL, then **Research library**. The existing real research and drafts should appear because the hosted app uses the same Supabase database. Open the completed three-prospect run described in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

Open **Research connections → Check connections** to verify the deployed environment. Then start one small research run if you want to test the hosted workflow itself. A local successful run verifies the integrations; it does not by itself verify Vercel's workflow runtime.

If a new run reports a read-only filesystem error, turn on system environment variables and redeploy. If the library is empty, check `HIROX_STORAGE=supabase`, the project URL, and the server secret key. Environment changes require a redeployment.

Official references: [Vercel Workflow](https://vercel.com/docs/workflows), [Fluid Compute](https://vercel.com/docs/fluid-compute). Workflow deployment details were also checked against the installed `workflow` 5.2.3 documentation.
