import { R2_CONFIG, getR2PublicUrl } from "@/lib/r2";

export interface R2UploadResult {
  success: boolean;
  url: string;
  proxyUrl?: string;
  key?: string;
  error?: string;
}

export interface R2MediaItem {
  id: string;
  key?: string;
  url: string;
  proxyUrl?: string;
  name: string;
  type: "image" | "video";
  dateAdded: string;
  isCustom: boolean;
  storageProvider: "r2" | "cloud" | "local";
}

/**
 * Uploads a file (photo or video) to Cloudflare R2 storage via Cloudflare Worker
 */
export const uploadFileToR2 = async (
  file: File,
  customTitle: string,
  workerUrl?: string
): Promise<R2UploadResult> => {
  const rawEndpoint =
    workerUrl ||
    localStorage.getItem("kavya_gowtham_r2_worker_url") ||
    import.meta.env.VITE_R2_WORKER_URL ||
    R2_CONFIG.workerUrl;

  try {
    let endpoint = rawEndpoint.trim();
    if (endpoint.endsWith("/list") || endpoint.endsWith("/delete") || endpoint.endsWith("/view")) {
      endpoint = endpoint.replace(/\/(list|delete|view)$/, "/upload");
    } else if (!endpoint.endsWith("/upload")) {
      endpoint = endpoint.replace(/\/+$/, "") + "/upload";
    }

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
    if (data.error) {
      throw new Error(data.error);
    }

    const key = data.key;
    const publicUrl = data.url || getR2PublicUrl(key);
    const workerOrigin = new URL(endpoint).origin;
    const proxyUrl = `${workerOrigin}/view?key=${encodeURIComponent(key)}`;

    return {
      success: true,
      url: publicUrl,
      proxyUrl,
      key,
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

/**
 * Fetches all media items stored directly in Cloudflare R2 bucket via Cloudflare Worker
 */
export const fetchR2UploadedMedia = async (
  workerUrl?: string
): Promise<R2MediaItem[]> => {
  const rawEndpoint =
    workerUrl ||
    localStorage.getItem("kavya_gowtham_r2_worker_url") ||
    import.meta.env.VITE_R2_WORKER_URL ||
    R2_CONFIG.workerUrl;

  if (!rawEndpoint) return [];

  try {
    let listUrl = rawEndpoint.trim();
    if (listUrl.endsWith("/upload") || listUrl.endsWith("/delete") || listUrl.endsWith("/view")) {
      listUrl = listUrl.replace(/\/(upload|delete|view)$/, "/list");
    } else if (!listUrl.endsWith("/list")) {
      listUrl = listUrl.replace(/\/+$/, "") + "/list";
    }

    const response = await fetch(listUrl, { method: "GET" });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    const workerOrigin = new URL(listUrl).origin;

    return data.map((item: any) => {
      const key = item.key || item.id || "";
      const publicUrl = item.url || getR2PublicUrl(key);
      const proxyUrl = item.proxyUrl || `${workerOrigin}/view?key=${encodeURIComponent(key)}`;

      return {
        id: item.id || `r2-${key || Date.now()}`,
        key: key,
        url: publicUrl,
        proxyUrl: proxyUrl,
        name: item.name || "Cloud Memory",
        type: item.type === "video" ? "video" : "image",
        dateAdded: item.dateAdded || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        isCustom: true,
        storageProvider: "r2" as const,
      };
    });
  } catch (error) {
    console.warn("Error fetching Cloudflare R2 media list:", error);
    return [];
  }
};

/**
 * Deletes a media file from Cloudflare R2 storage via Cloudflare Worker
 */
export const deleteR2Media = async (
  key: string,
  workerUrl?: string
): Promise<boolean> => {
  const rawEndpoint =
    workerUrl ||
    localStorage.getItem("kavya_gowtham_r2_worker_url") ||
    import.meta.env.VITE_R2_WORKER_URL ||
    R2_CONFIG.workerUrl;

  if (!rawEndpoint || !key) return false;

  try {
    let deleteUrl = rawEndpoint.trim();
    if (deleteUrl.endsWith("/upload") || deleteUrl.endsWith("/list") || deleteUrl.endsWith("/view")) {
      deleteUrl = deleteUrl.replace(/\/(upload|list|view)$/, "/delete");
    } else if (!deleteUrl.endsWith("/delete")) {
      deleteUrl = deleteUrl.replace(/\/+$/, "") + "/delete";
    }

    deleteUrl += `?key=${encodeURIComponent(key)}`;

    const response = await fetch(deleteUrl, { method: "DELETE" });
    return response.ok;
  } catch (error) {
    console.error("Error deleting from Cloudflare R2:", error);
    return false;
  }
};
