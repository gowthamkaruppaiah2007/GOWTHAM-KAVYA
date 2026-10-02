import { useState } from "react";
import { Cloud, X, Copy, Check, ExternalLink, ShieldCheck, Database, Key, CheckCircle2 } from "lucide-react";
import { R2_CONFIG } from "@/lib/r2";

interface R2GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const R2GuideModal = ({ isOpen, onClose }: R2GuideModalProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const workerCode = `// Cloudflare Worker Code tailored for your bucket "kavya-gowtham-memories"
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle File Upload: POST /upload
    if (url.pathname === "/upload" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const customTitle = formData.get("name") || file.name;
        
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const key = \`uploads/\${timestamp}-\${customTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.\${fileExt}\`;

        // Upload directly to your R2 Bucket "kavya-gowtham-memories"
        await env.MY_R2_BUCKET.put(key, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        // Public Dev URL
        const publicUrl = \`https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/\${key}\`;
        
        return new Response(JSON.stringify({ 
          success: true, 
          url: publicUrl, 
          key,
          name: customTitle,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Cloudflare R2 Worker for Kavya & Gowtham is active!", { 
      headers: corsHeaders 
    });
  }
};`;

  const frontendCode = `// Frontend API Upload Integration
const uploadToR2Worker = async (file: File, name: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  // Replace with your deployed Worker URL (e.g., https://r2-upload.yourname.workers.dev/upload)
  const response = await fetch("YOUR_WORKER_URL/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log("Uploaded to R2:", data.url);
  return data.url; // Returns https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev/uploads/...
};`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-foreground/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-background border border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-8 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <Cloud size={28} />
          </div>
          <div>
            <h2 className="font-serif-display text-2xl font-bold text-foreground flex items-center gap-2">
              Cloudflare R2 Connected
              <CheckCircle2 size={18} className="text-emerald-500" />
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Bucket: <code className="bg-muted px-2 py-0.5 rounded text-primary font-mono">{R2_CONFIG.bucketName}</code>
            </p>
          </div>
        </div>

        {/* Current Credentials Card */}
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 mb-6 space-y-2 font-mono text-xs text-foreground">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold font-body">Public Dev URL:</span>
            <span className="text-sky-600 dark:text-sky-400 truncate max-w-xs">{R2_CONFIG.publicDevUrl}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-semibold font-body">S3 API Endpoint:</span>
            <span className="text-sky-600 dark:text-sky-400 truncate max-w-xs">{R2_CONFIG.s3Endpoint}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6 text-foreground font-body text-sm leading-relaxed max-h-[55vh] overflow-y-auto pr-2">
          {/* Step 1 */}
          <div className="bg-muted/40 p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 font-bold text-primary mb-2">
              <Database size={18} />
              <span>Step 1: R2 Bucket is Ready</span>
            </div>
            <p className="text-muted-foreground text-xs leading-normal">
              Your bucket <strong>kavya-gowtham-memories</strong> is configured with public domain <code className="bg-muted px-1.5 py-0.5 rounded text-primary">https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev</code>. All uploaded images/videos will render instantly from this domain!
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-muted/40 p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 font-bold text-primary mb-2">
              <Key size={18} />
              <span>Step 2: Deploy Cloudflare Worker Script</span>
            </div>
            <p className="text-muted-foreground text-xs mb-3">
              In Cloudflare Dashboard &rarr; <strong>Workers & Pages</strong> &rarr; Create Worker, paste the pre-configured script below and bind <code>MY_R2_BUCKET</code> to <code>kavya-gowtham-memories</code>:
            </p>
            <div className="relative bg-zinc-950 text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard(workerCode, "worker")}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1 text-xs"
              >
                {copiedSection === "worker" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedSection === "worker" ? "Copied" : "Copy Worker Code"}
              </button>
              <pre>{workerCode}</pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-muted/40 p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2 font-bold text-primary mb-2">
              <ShieldCheck size={18} />
              <span>Step 3: Frontend Integration Code</span>
            </div>
            <p className="text-muted-foreground text-xs mb-3">
              Use this snippet in your React application to upload photos/videos directly to your R2 bucket:
            </p>
            <div className="relative bg-zinc-950 text-zinc-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <button
                onClick={() => copyToClipboard(frontendCode, "frontend")}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1 text-xs"
              >
                {copiedSection === "frontend" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedSection === "frontend" ? "Copied" : "Copy Frontend Code"}
              </button>
              <pre>{frontendCode}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default R2GuideModal;
