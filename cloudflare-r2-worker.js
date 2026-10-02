/**
 * Cloudflare Worker for Kavya & Gowtham R2 Storage
 * 
 * Bucket Name: kavya-gowtham-memories
 * R2 Public Domain: https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Enable CORS for all requests from web app
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // UPLOAD ENDPOINT: POST /upload
    if ((url.pathname === "/upload" || url.pathname === "/") && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const customName = formData.get("name") || (file && file.name) || "memory";

        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Clean filename and generate R2 Key
        const extension = file.name ? file.name.split(".").pop() : "jpg";
        const cleanSlug = customName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        const r2Key = `uploads/${Date.now()}-${cleanSlug}.${extension}`;

        // Put object into R2 bucket (bound as MY_R2_BUCKET)
        await env.MY_R2_BUCKET.put(r2Key, file.stream(), {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
          },
        });

        // Generate public R2 URL
        const publicUrl = `https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/${r2Key}`;

        return new Response(
          JSON.stringify({
            success: true,
            url: publicUrl,
            key: r2Key,
            name: customName,
            type: file.type.startsWith("video/") ? "video" : "image",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // LIST ENDPOINT: GET /list
    if (url.pathname === "/list" && request.method === "GET") {
      try {
        const objects = await env.MY_R2_BUCKET.list({ prefix: "uploads/" });
        const items = objects.objects.map((obj) => ({
          key: obj.key,
          url: `https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/${obj.key}`,
          uploaded: obj.uploaded,
          size: obj.size,
        }));
        return new Response(JSON.stringify(items), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Kavya & Gowtham R2 Worker Service is Live!", {
      headers: corsHeaders,
    });
  },
};
