import { R2_CONFIG } from "@/lib/r2";

export interface R2UploadResult {
  success: boolean;
  url: string;
  key?: string;
  error?: string;
}

/**
 * Uploads a file (photo or video) to Cloudflare R2 storage via Cloudflare Worker
 */
export const uploadFileToR2 = async (
  file: File,
  customTitle: string,
  workerUrl?: string
): Promise<R2UploadResult> => {
  const endpoint =
    workerUrl ||
    localStorage.getItem("kavya_gowtham_r2_worker_url") ||
    import.meta.env.VITE_R2_WORKER_URL ||
    R2_CONFIG.workerUrl;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", customTitle || file.name);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url || `${R2_CONFIG.publicDevUrl}/${data.key}`,
      key: data.key,
    };
  } catch (error: any) {
    console.error("Cloudflare R2 Upload Error:", error);
    return {
      success: false,
      url: "",
      error: error.message || "Failed to upload to Cloudflare R2",
    };
  }
};
