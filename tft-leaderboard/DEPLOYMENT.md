# Deploying to Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- The Vercel CLI installed (optional): `npm i -g vercel`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will automatically detect Next.js
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the `tft-leaderboard` directory
3. Run `vercel login`
4. Run `vercel` to deploy
5. Follow the prompts

## Important Notes

### Data File
The application reads from `public/ranking_board_tactics.json`. You have two options:

1. **Static deployment**: Keep the current JSON file in `public/` directory. The data will be baked into the deployment.
   - To update data, you'll need to redeploy after running the Python scraper

2. **Dynamic updates**: Set up a cron job or GitHub Action to:
   - Run the Python scraper
   - Update the JSON file
   - Trigger a Vercel deployment via webhook

### Environment Variables
No environment variables are currently required for this deployment.

### Build Configuration
The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Framework: Next.js
- Output directory: `.next`

## Updating Data After Deployment

### Manual Update
1. Run the Python scraper locally: `python tactics_scraper.py`
2. Copy the updated `ranking_board_tactics.json` to `tft-leaderboard/public/`
3. Commit and push changes
4. Vercel will automatically redeploy

### Automated Update (GitHub Actions)
You can set up a GitHub Action to run the scraper periodically and update the deployment. See the GitHub Actions documentation for details.

## Vercel Deployment URL
After deployment, Vercel will provide you with a URL like:
- `https://your-project-name.vercel.app`

You can also set up a custom domain in the Vercel dashboard.
