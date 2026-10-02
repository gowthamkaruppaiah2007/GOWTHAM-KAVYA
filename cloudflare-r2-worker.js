/**
 * Cloudflare Worker for Kavya & Gowtham R2 Storage
 * 
 * Bucket Name: kavya-gowtham-memories
 * R2 Public Domain: https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev
 * 
 * Instructions:
 * 1. Go to Cloudflare Dashboard -> Workers & Pages -> Create Worker
 * 2. Paste this code into Worker Editor and Save & Deploy
 * 3. Go to Worker Settings -> Variables -> R2 Bucket Bindings
 * 4. Add Binding:
 *    - Variable name: MY_R2_BUCKET
 *    - R2 Bucket: kavya-gowtham-memories
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Enable CORS for cross-origin requests from any device/browser
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const bucket = env.MY_R2_BUCKET || env.R2_BUCKET || env.BUCKET;

    if (!bucket) {
      return new Response(
        JSON.stringify({ 
          error: "MY_R2_BUCKET binding missing. Please bind MY_R2_BUCKET to 'kavya-gowtham-memories' in Worker Settings." 
        }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. UPLOAD ENDPOINT: POST /upload
    if ((url.pathname === "/upload" || url.pathname === "/") && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const customName = formData.get("name") || (file && file.name) || "Memory Photo";

        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const extension = file.name ? file.name.split(".").pop() : "jpg";
        const cleanSlug = customName.toString().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
        const timestamp = Date.now();
        const r2Key = `uploads/${timestamp}-${cleanSlug}.${extension}`;
        const isVideo = file.type.startsWith("video/") || ["mp4", "mov", "webm"].includes(extension.toLowerCase());

        // Upload to R2 Bucket
        await bucket.put(r2Key, file.stream(), {
          httpMetadata: {
            contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
          },
          customMetadata: {
            name: encodeURIComponent(customName.toString()),
            type: isVideo ? "video" : "image",
            dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          }
        });

        const publicUrl = `https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/${r2Key}`;

        return new Response(
          JSON.stringify({
            success: true,
            url: publicUrl,
            key: r2Key,
            name: customName,
            type: isVideo ? "video" : "image",
            dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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

    // 2. LIST ENDPOINT: GET /list
    if ((url.pathname === "/list" || url.pathname === "/files") && request.method === "GET") {
      try {
        const objects = await bucket.list({ prefix: "uploads/" });
        const items = objects.objects.map((obj) => {
          const keyParts = obj.key.replace("uploads/", "").split("-");
          const ext = obj.key.split(".").pop() || "";
          const isVideo = ["mp4", "mov", "webm", "m4v", "avi"].includes(ext.toLowerCase());
          
          let name = obj.customMetadata?.name ? decodeURIComponent(obj.customMetadata.name) : "";
          if (!name) {
            const rawName = keyParts.slice(1).join("-").replace(/\.[^/.]+$/, "").replace(/-/g, " ");
            name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "Shared Memory";
          }

          return {
            id: `r2-${obj.key}`,
            key: obj.key,
            url: `https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/${obj.key}`,
            name: name,
            type: obj.customMetadata?.type || (isVideo ? "video" : "image"),
            dateAdded: obj.customMetadata?.dateAdded || new Date(obj.uploaded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            isCustom: true,
            storageProvider: "r2",
          };
        });

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

    // 3. DELETE ENDPOINT: DELETE /delete?key=...
    if (url.pathname === "/delete" && (request.method === "DELETE" || request.method === "POST")) {
      try {
        const keyToDelete = url.searchParams.get("key");
        if (!keyToDelete) {
          return new Response(JSON.stringify({ error: "Missing key parameter" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await bucket.delete(keyToDelete);
        return new Response(JSON.stringify({ success: true, key: keyToDelete }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Kavya & Gowtham R2 Worker Service is Active! ☁️❤️",
        endpoints: {
          upload: "POST /upload",
          list: "GET /list",
          delete: "DELETE /delete?key=uploads/...",
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  },
};
