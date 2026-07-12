# Naili Build Plan — Full Product

## Architecture

### New API Routes
1. `POST /api/vision/intelligence-report` — DeepSeek generates market report from ZIP + category + photo analysis
2. `POST /api/vision/video-flythrough` — Takes concept image → generates 5s Sora/Veo flythrough video
3. `POST /api/vision/update-estimate` — Accepts scope changes (quality, materials, notes) → recalculates estimate + regenerates concept
4. `POST /api/vision/contractor-lead` — Submits a locked project as a premium lead

### New DB Tables
1. `intelligence_reports` — per-project market report data
2. `project_videos` — generated flythrough video URLs
3. `project_iterations` — scope snapshots as user plays with cost playground

### New Components
1. `components/vision/IntelligenceReport.tsx` — "Your Reno Intelligence" dashboard
2. `components/vision/CostPlayground.tsx` — Interactive sliders + checkboxes + real-time estimate
3. `components/vision/VideoFlythrough.tsx` — Embedded 5s video with play button
4. `components/vision/ContractorLeadModal.tsx` — Collect homeowner info, submit lead

### Changes To Existing
- `types/index.ts` — new types
- `components/vision/VisionResultsView.tsx` — wire in all new sections
- `app/vision/results/[project_id]/page.tsx` — fetch new data
- `supabase/migrations/` — schema additions
