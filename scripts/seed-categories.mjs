// Seed real YouTube videos into category tags so the home-page chips filter.
// Pulls real title/channel from oEmbed and skips any non-embeddable id.
// Usage:  node --env-file=.env.local scripts/seed-categories.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run: node --env-file=.env.local scripts/seed-categories.mjs");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

// category tag -> candidate YouTube ids (validated via oEmbed; failures skipped)
const CATALOG = {
  music: ["dQw4w9WgXcQ", "kJQP7kiw5Fk", "9bZkp7q19f0", "OPf0YbXqDm0", "JGwWNGJdvx8"],
  gaming: ["aqz-KE-bpKQ", "ScMzIvxBSi4"],
  coding: ["rfscVS0vtbw", "PkZNo7MFNFg", "Ke90Tje7VS0"],
  live: ["jfKfPfyJRdk", "5qap5aO4i9A"],
  education: ["ysz5S6PUM-U", "aqz-KE-bpKQ"],
  podcasts: ["5qap5aO4i9A", "jfKfPfyJRdk"],
  travel: ["LXb3EKWsInQ", "1La4QzGeaaQ"],
  news: ["jNQXAC9IVRw", "dQw4w9WgXcQ"],
  comedy: ["ScMzIvxBSi4", "aqz-KE-bpKQ"],
};

function slugify(name) {
  const s = name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s.length >= 3 ? s.slice(0, 24) : `chan_${s}`;
}

async function oembed(id) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
  );
  if (!res.ok) throw new Error(`oEmbed ${res.status}`);
  return res.json();
}

async function ensureTag(name) {
  await supabase.from("tags").upsert({ name }, { onConflict: "name", ignoreDuplicates: true });
  const { data } = await supabase.from("tags").select("id").eq("name", name).single();
  return data.id;
}

const channelCache = new Map();
async function ensureChannel(authorName) {
  if (channelCache.has(authorName)) return channelCache.get(authorName);
  const slug = slugify(authorName);
  const email = `${slug}@yt.demo.streamly.app`;
  const { data: list } = await supabase.auth.admin.listUsers();
  let user = list?.users?.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "password123",
      email_confirm: true,
      user_metadata: { user_name: slug, full_name: authorName, avatar_url: `https://i.pravatar.cc/150?u=${slug}` },
    });
    if (error) throw error;
    user = data.user;
  }
  await supabase
    .from("profiles")
    .update({
      display_name: authorName,
      avatar_url: `https://i.pravatar.cc/150?u=${slug}`,
      banner_url: `https://picsum.photos/seed/${slug}/1280/320`,
    })
    .eq("id", user.id);
  channelCache.set(authorName, user.id);
  return user.id;
}

// video_url -> video id (created once, reused across categories)
const videoCache = new Map();
async function ensureVideo(id, meta) {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  if (videoCache.has(videoUrl)) return videoCache.get(videoUrl);

  const { data: existing } = await supabase
    .from("videos")
    .select("id")
    .eq("video_url", videoUrl)
    .maybeSingle();
  if (existing) {
    videoCache.set(videoUrl, existing.id);
    return existing.id;
  }

  const creatorId = await ensureChannel(meta.author_name);
  const { data, error } = await supabase
    .from("videos")
    .insert({
      user_id: creatorId,
      title: meta.title,
      description: `${meta.title}\n\nBy ${meta.author_name}`,
      video_url: videoUrl,
      thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: 0,
      views_count: Math.floor(Math.random() * 500000),
      visibility: "public",
    })
    .select("id")
    .single();
  if (error) throw error;
  videoCache.set(videoUrl, data.id);
  return data.id;
}

async function main() {
  for (const [category, ids] of Object.entries(CATALOG)) {
    const tagId = await ensureTag(category);
    let count = 0;
    for (const id of ids) {
      try {
        const meta = await oembed(id);
        const videoId = await ensureVideo(id, meta);
        await supabase
          .from("video_tags")
          .upsert({ video_id: videoId, tag_id: tagId }, { onConflict: "video_id,tag_id", ignoreDuplicates: true });
        count++;
      } catch (e) {
        console.error(`  ✗ ${category}/${id}: ${e.message}`);
      }
    }
    console.log(`✓ ${category}: ${count} video(s)`);
  }
  console.log("\nDone seeding categories.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
