import { MediaItem } from "@/pages/Photos";

const CLOUD_SYNC_KEY = "kavya_gowtham_cloud_media_v2";
// Free public shared sync storage URL (npoint/jsonbin JSON sync fallback)
const SYNC_BIN_URL = "https://api.jsonbin.io/v3/b/66fa19b5e41b4d34e4390b12"; 

/**
 * Fetches cross-device synced media items from shared cloud storage & local backup
 */
export const fetchCloudSyncedMedia = async (): Promise<MediaItem[]> => {
  // 1. Load local cache
  const localSaved = localStorage.getItem("kavya_gowtham_user_media");
  let localItems: MediaItem[] = [];
  if (localSaved) {
    try {
      localItems = JSON.parse(localSaved);
    } catch (e) {
      console.error("Failed to parse local media", e);
    }
  }

  // 2. Attempt fetching from shared cloud store
  try {
    const res = await fetch("https://kv.valetown.net/kavya_gowtham_photos", {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const remoteItems: MediaItem[] = await res.json();
      if (Array.isArray(remoteItems) && remoteItems.length > 0) {
        // Merge remote items with local items, removing duplicates by id or url
        const map = new Map<string, MediaItem>();
        localItems.forEach((item) => map.set(item.id || item.url, item));
        remoteItems.forEach((item) => map.set(item.id || item.url, item));

        const merged = Array.from(map.values());
        localStorage.setItem("kavya_gowtham_user_media", JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn("Cloud sync fetch fallback notice:", err);
  }

  return localItems;
};

/**
 * Syncs a new media item to shared cloud storage so all devices can view it
 */
export const syncMediaToCloud = async (newItem: MediaItem): Promise<MediaItem[]> => {
  // 1. Get current local list
  const existingStr = localStorage.getItem("kavya_gowtham_user_media") || "[]";
  let existingItems: MediaItem[] = [];
  try {
    existingItems = JSON.parse(existingStr);
  } catch (e) {
    existingItems = [];
  }

  // Deduplicate
  const filtered = existingItems.filter((i) => i.id !== newItem.id && i.url !== newItem.url);
  const updatedList = [newItem, ...filtered];

  // Save to local storage
  localStorage.setItem("kavya_gowtham_user_media", JSON.stringify(updatedList));

  // 2. Sync to shared cloud store
  try {
    // We send public image/video items (excluding huge base64 strings if any) to cloud sync
    const syncableItems = updatedList.filter((item) => !item.url.startsWith("data:"));
    
    await fetch("https://kv.valetown.net/kavya_gowtham_photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncableItems.slice(0, 100)),
    });
  } catch (err) {
    console.warn("Cloud sync post notice:", err);
  }

  return updatedList;
};

/**
 * Deletes an item from cloud sync and local storage
 */
export const deleteMediaFromCloud = async (id: string): Promise<MediaItem[]> => {
  const existingStr = localStorage.getItem("kavya_gowtham_user_media") || "[]";
  let existingItems: MediaItem[] = [];
  try {
    existingItems = JSON.parse(existingStr);
  } catch (e) {
    existingItems = [];
  }

  const updatedList = existingItems.filter((item) => item.id !== id);
  localStorage.setItem("kavya_gowtham_user_media", JSON.stringify(updatedList));

  try {
    const syncableItems = updatedList.filter((item) => !item.url.startsWith("data:"));
    await fetch("https://kv.valetown.net/kavya_gowtham_photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncableItems.slice(0, 100)),
    });
  } catch (err) {
    console.warn("Cloud sync delete notice:", err);
  }

  return updatedList;
};
