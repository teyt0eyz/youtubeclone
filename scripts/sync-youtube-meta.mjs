// Make each video's title + channel match the real YouTube video it plays.
// Pulls metadata from YouTube oEmbed (no API key) and reassigns each video to a
// creator profile named after its real YouTube channel.
// Usage:  node --env-file=.env.local scripts/sync-youtube-meta.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run: node --env-file=.env.local scripts/sync-youtube-meta.mjs");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function getYouTubeId(u) {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1) || null;
    if (host.endsWith("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2];
    }
  } catch {}
  return null;
}

function slugify(name) {
  const s = name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s.length >= 3 ? s.slice(0, 24) : `chan_${s}`;
}

async function fetchMeta(videoUrl) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`oEmbed ${res.status}`);
  return res.json(); // { title, author_name, author_url, ... }
}

// author_name -> profile id (created on demand)
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
      user_metadata: {
        user_name: slug,
        full_name: authorName,
        avatar_url: `https://i.pravatar.cc/150?u=${slug}`,
      },
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
      bio: `Official channel — synced from YouTube.`,
    })
    .eq("id", user.id);

  channelCache.set(authorName, user.id);
  return user.id;
}

async function main() {
  const { data: videos, error } = await supabase.from("videos").select("id, video_url");
  if (error) throw error;
  if (!videos?.length) {
    console.log("No videos. Run `npm run seed` first.");
    return;
  }

  let ok = 0;
  for (const v of videos) {
    const id = getYouTubeId(v.video_url);
    if (!id) {
      console.log(`- skip ${v.id} (not a YouTube URL)`);
      continue;
    }
    try {
      const meta = await fetchMeta(v.video_url);
      const creatorId = await ensureChannel(meta.author_name);
      const { error: upErr } = await supabase
        .from("videos")
        .update({
          user_id: creatorId,
          title: meta.title,
          description: `${meta.title}\n\nBy ${meta.author_name} · ${meta.author_url ?? ""}`.trim(),
          thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        })
        .eq("id", v.id);
      if (upErr) throw upErr;
      ok++;
      console.log(`✓ ${meta.author_name} — ${meta.title}`);
    } catch (e) {
      console.error(`✗ ${v.id}: ${e.message}`);
    }
  }
  console.log(`\nDone. Synced ${ok}/${videos.length} videos to real YouTube metadata.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
