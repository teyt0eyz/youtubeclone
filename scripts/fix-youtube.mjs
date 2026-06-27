// Rewrite every existing video to a real, embeddable YouTube URL + thumbnail.
// Usage:  node --env-file=.env.local scripts/fix-youtube.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env. Run: node --env-file=.env.local scripts/fix-youtube.mjs");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const YT = [
  { id: "aqz-KE-bpKQ", duration: 635 },
  { id: "LXb3EKWsInQ", duration: 305 },
  { id: "dQw4w9WgXcQ", duration: 213 },
  { id: "jNQXAC9IVRw", duration: 19 },
  { id: "ScMzIvxBSi4", duration: 596 },
  { id: "ysz5S6PUM-U", duration: 654 },
  { id: "1La4QzGeaaQ", duration: 480 },
  { id: "5qap5aO4i9A", duration: 3600 },
];

async function main() {
  const { data: videos, error } = await supabase
    .from("videos")
    .select("id, video_url");
  if (error) throw error;

  if (!videos?.length) {
    console.log("No videos found. Run `npm run seed` first.");
    return;
  }

  let updated = 0;
  for (const v of videos) {
    if (v.video_url && v.video_url.includes("youtu")) continue; // already YouTube
    const pick = YT[Math.floor(Math.random() * YT.length)];
    const { error: upErr } = await supabase
      .from("videos")
      .update({
        video_url: `https://www.youtube.com/watch?v=${pick.id}`,
        thumbnail_url: `https://i.ytimg.com/vi/${pick.id}/hqdefault.jpg`,
        duration: pick.duration,
      })
      .eq("id", v.id);
    if (upErr) {
      console.error(`✗ ${v.id}:`, upErr.message);
    } else {
      updated++;
    }
  }

  console.log(`✓ Updated ${updated}/${videos.length} videos to YouTube URLs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
