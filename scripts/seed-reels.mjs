// Seed a handful of short-form videos so the Reels feed has content.
// Idempotent: skips any reel whose video_url already exists.
// Usage:  node --env-file=.env.local scripts/seed-reels.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Run with: node --env-file=.env.local scripts/seed-reels.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Real, embeddable YouTube clips served as Shorts URLs (≤ 60s feel). The player
// and the getReels query both recognise the `/shorts/` URL shape.
const REELS = [
  { id: "jNQXAC9IVRw", title: "Me at the zoo 🐘 #shorts", duration: 19 },
  { id: "aqz-KE-bpKQ", title: "Big Buck Bunny — quick clip #shorts", duration: 45 },
  { id: "ScMzIvxBSi4", title: "Blender open movie teaser #shorts", duration: 30 },
  { id: "LXb3EKWsInQ", title: "Costa Rica vibes #shorts", duration: 50 },
];

async function main() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username")
    .limit(10);
  if (error) throw error;
  if (!profiles || profiles.length === 0) {
    console.error("No profiles found — run scripts/seed.mjs first.");
    process.exit(1);
  }

  let inserted = 0;
  for (let i = 0; i < REELS.length; i++) {
    const r = REELS[i];
    const owner = profiles[i % profiles.length];
    const video_url = `https://www.youtube.com/shorts/${r.id}`;

    const { data: existing } = await supabase
      .from("videos")
      .select("id")
      .eq("video_url", video_url)
      .maybeSingle();
    if (existing) {
      console.log(`• skip (already seeded): ${r.title}`);
      continue;
    }

    const { error: insErr } = await supabase.from("videos").insert({
      user_id: owner.id,
      title: r.title,
      description: `${r.title} — demo short uploaded by @${owner.username}.`,
      video_url,
      thumbnail_url: `https://i.ytimg.com/vi/${r.id}/hqdefault.jpg`,
      duration: r.duration,
      views_count: Math.floor(Math.random() * 80000),
      visibility: "public",
    });
    if (insErr) throw insErr;
    inserted++;
    console.log(`✓ seeded reel: ${r.title} (@${owner.username})`);
  }

  console.log(`\nDone. ${inserted} new reel(s) added.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
