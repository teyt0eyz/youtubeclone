// Seed demo creators + videos using the Supabase service role.
// Usage:  node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Run with: node --env-file=.env.local scripts/seed.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Real, embeddable YouTube videos. The player detects YouTube URLs and embeds
// them via iframe, so demo content plays out of the box.
const SAMPLE_VIDEOS = [
  { id: "aqz-KE-bpKQ", title: "Big Buck Bunny (4K)", duration: 635 },
  { id: "LXb3EKWsInQ", title: "Costa Rica in 4K", duration: 305 },
  { id: "5qap5aO4i9A", title: "lofi hip hop radio — beats to relax/study to", duration: 3600 },
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", duration: 213 },
  { id: "jNQXAC9IVRw", title: "Me at the zoo", duration: 19 },
  { id: "ScMzIvxBSi4", title: "Big Buck Bunny — Blender", duration: 596 },
  { id: "ysz5S6PUM-U", title: "Elephants Dream", duration: 654 },
  { id: "1La4QzGeaaQ", title: "Sample Coding Session", duration: 480 },
];

const CREATORS = [
  { username: "pixelforge", display: "PixelForge Studios", bio: "Game dev devlogs & engine deep-dives." },
  { username: "lofiloops", display: "Lo-Fi Loops", bio: "Chill beats to code and relax to." },
  { username: "trailmix", display: "Trail Mix", bio: "Backcountry travel and hiking films." },
  { username: "byteacademy", display: "Byte Academy", bio: "Practical software engineering tutorials." },
];

async function ensureUser(email, password, meta) {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) return existing.id;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const createdIds = [];

  for (const c of CREATORS) {
    const email = `${c.username}@demo.streamly.app`;
    const id = await ensureUser(email, "password123", {
      user_name: c.username,
      full_name: c.display,
      avatar_url: `https://i.pravatar.cc/150?u=${c.username}`,
    });
    createdIds.push(id);

    await supabase
      .from("profiles")
      .update({
        display_name: c.display,
        bio: c.bio,
        avatar_url: `https://i.pravatar.cc/150?u=${c.username}`,
        banner_url: `https://picsum.photos/seed/${c.username}/1280/320`,
      })
      .eq("id", id);

    // 2-3 videos each
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const v = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
      await supabase.from("videos").insert({
        user_id: id,
        title: v.title,
        description: `${v.title} — uploaded by ${c.display}. Demo seed content.`,
        video_url: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnail_url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.duration,
        views_count: Math.floor(Math.random() * 250000),
        visibility: "public",
      });
    }
    console.log(`✓ seeded ${c.username} (${count} videos)`);
  }

  // A few cross-subscriptions for a non-empty Subscriptions feed.
  if (createdIds.length >= 2) {
    await supabase.from("subscriptions").insert([
      { subscriber_id: createdIds[0], creator_id: createdIds[1] },
      { subscriber_id: createdIds[0], creator_id: createdIds[2] },
      { subscriber_id: createdIds[1], creator_id: createdIds[0] },
    ]);
  }

  console.log("\nDone. Demo logins: <username>@demo.streamly.app / password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
