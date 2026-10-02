// Cloudflare R2 Storage Configuration for Kavya & Gowtham Memories
export const R2_CONFIG = {
  accountPath: "b8f6f47d12c433d1d3f0d9a50b87fd6b",
  bucketName: "kavya-gowtham-memories",
  publicDevUrl: "https://pub-19f042b705484ca39ef335d2596b0ec8.r2.dev",
  s3Endpoint: "https://b8f6f47d12c433d1d3f0d9a50b87fd6b.r2.cloudflarestorage.com/kavya-gowtham-memories",
  // Live Cloudflare Worker URL
  workerUrl: "https://white-resonance-e647.gowthamkaruppaiah6.workers.dev/upload",
};

/**
 * Generates a public R2 URL for a given object key
 */
export const getR2PublicUrl = (key: string): string => {
  if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("data:")) {
    return key;
  }
  const cleanKey = key.replace(/^\/+/, "");
  return `${R2_CONFIG.publicDevUrl}/${cleanKey}`;
};
