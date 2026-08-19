# LeadFlow HQ — Landing Page Deployment

Static single-file landing page, deployed via GitHub Pages with the custom domain leadflowhq.tech (registered on Porkbun).

## 1. Push to GitHub

```bash
# from inside this folder
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin https://github.com/<your-username>/leadflowhq.git
git push -u origin main
```

If you create the repo on github.com first, just clone it and drop `index.html` and `CNAME` in, then commit/push.

## 2. Turn on GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to `Deploy from a branch`
3. Branch: `main`, folder: `/ (root)`
4. Save. GitHub will build the site at `https://<your-username>.github.io/leadflowhq/`

The `CNAME` file (containing `leadflowhq.tech`) is already in this repo — GitHub Pages reads it automatically once the domain is verified in step 3.

## 3. Point leadflowhq.tech at GitHub Pages (in Porkbun)

In Porkbun → your domain → **DNS Records**, add:

**A records** (apex domain `leadflowhq.tech`) — add all four, pointing at GitHub Pages' IPs:
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

**CNAME record** (for `www`):
```
CNAME    www    <your-username>.github.io.
```

Remove any existing A or CNAME records on `@`/`www` that Porkbun's default parking page may have set up first.

## 4. Verify custom domain in GitHub

Back in repo **Settings → Pages**, under "Custom domain" enter `leadflowhq.tech` and save. GitHub will check DNS (can take up to a few hours to propagate) and issue an HTTPS certificate automatically. Once it shows "DNS check successful," check **Enforce HTTPS**.

## Notes

- DNS propagation is usually 10–30 min but can take up to 24h.
- If you want `www.leadflowhq.tech` to also work and redirect to the apex, GitHub Pages handles that automatically once both records above are set and the custom domain is verified.
- To update the site later: edit `index.html`, commit, push — GitHub Pages redeploys automatically within a minute or two.
