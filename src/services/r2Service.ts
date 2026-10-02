import { R2_CONFIG } from "@/lib/r2";

export interface R2UploadResult {
  success: boolean;
  url: string;
  key?: string;
  error?: string;
}

export interface R2MediaItem {
  id: string;
  key?: string;
  url: string;
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
    if (endpoint.endsWith("/list") || endpoint.endsWith("/delete")) {
      endpoint = endpoint.replace(/\/(list|delete)$/, "/upload");
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
    if (listUrl.endsWith("/upload") || listUrl.endsWith("/delete")) {
      listUrl = listUrl.replace(/\/(upload|delete)$/, "/list");
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

    return data.map((item: any) => ({
      id: item.id || `r2-${item.key || Date.now()}`,
      key: item.key,
      url: item.url,
      name: item.name || "Cloud Memory",
      type: item.type === "video" ? "video" : "image",
      dateAdded: item.dateAdded || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isCustom: true,
      storageProvider: "r2" as const,
    }));
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
    if (deleteUrl.endsWith("/upload") || deleteUrl.endsWith("/list")) {
      deleteUrl = deleteUrl.replace(/\/(upload|list)$/, "/delete");
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
