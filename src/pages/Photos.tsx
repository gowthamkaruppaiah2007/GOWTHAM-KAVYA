import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import R2GuideModal from "@/components/R2GuideModal";
import { R2_CONFIG } from "@/lib/r2";
import { uploadFileToR2 } from "@/services/r2Service";
import { 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Sparkles, 
  Trash2, 
  X, 
  Play, 
  Plus, 
  Heart,
  Tag,
  CheckCircle2,
  Cloud,
  Link as LinkIcon,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  dateAdded: string;
  isCustom?: boolean;
  storageProvider?: "r2" | "local";
}

const initialPhotos: MediaItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `default-${i + 1}`,
  url: `/images/photo${i + 1}.jpg`,
  name: `Special Moment #${i + 1}`,
  type: "image",
  dateAdded: "Valentine's Album",
  isCustom: false,
  storageProvider: "local"
}));

const PhotosPage = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem("kavya_gowtham_user_media");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...parsed, ...initialPhotos];
      } catch (e) {
        console.error("Failed to parse saved media", e);
      }
    }
    return initialPhotos;
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isR2ModalOpen, setIsR2ModalOpen] = useState(false);

  // Cloudflare R2 Worker Endpoint
  const [r2WorkerUrl, setR2WorkerUrl] = useState<string>(() => {
    return localStorage.getItem("kavya_gowtham_r2_worker_url") || R2_CONFIG.workerUrl;
  });
  const [showR2Config, setShowR2Config] = useState(false);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save R2 Worker URL
  const handleSaveR2WorkerUrl = (url: string) => {
    setR2WorkerUrl(url);
    localStorage.setItem("kavya_gowtham_r2_worker_url", url.trim());
  };

  // Handle File Selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setUploadFile(file);
    const isVid = file.type.startsWith("video/");
    setMediaType(isVid ? "video" : "image");
    
    if (!mediaTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setMediaTitle(cleanName);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Upload Handler (R2 Cloud or Local Fallback)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    // Try Cloudflare R2 upload first if Worker URL exists
    if (r2WorkerUrl.trim()) {
      const result = await uploadFileToR2(uploadFile, mediaTitle, r2WorkerUrl.trim());
      if (result.success && result.url) {
        const newItem: MediaItem = {
          id: `r2-${Date.now()}`,
          url: result.url,
          name: mediaTitle.trim() || "Memory",
          type: mediaType,
          dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          isCustom: true,
          storageProvider: "r2",
        };

        saveItemToStateAndStorage(newItem);
        setUploadStatus({
          type: "success",
          message: "Uploaded & stored directly in Cloudflare R2 bucket! ☁️❤️",
        });
        setIsUploading(false);
        setTimeout(() => resetUploadForm(), 1500);
        return;
      } else {
        console.warn("R2 Upload error, storing locally:", result.error);
      }
    }

    // Local Storage Base64 fallback if no Worker URL or fallback needed
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const newItem: MediaItem = {
        id: `custom-${Date.now()}`,
        url: base64Url,
        name: mediaTitle.trim() || (mediaType === "video" ? "Memory Video" : "Memory Photo"),
        type: mediaType,
        dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        isCustom: true,
        storageProvider: "local",
      };

      saveItemToStateAndStorage(newItem);
      setUploadStatus({
        type: "success",
        message: "Memory saved to gallery! ❤️",
      });
      setIsUploading(false);
      setTimeout(() => resetUploadForm(), 1500);
    };
    reader.readAsDataURL(uploadFile);
  };

  const saveItemToStateAndStorage = (newItem: MediaItem) => {
    const customItems = JSON.parse(localStorage.getItem("kavya_gowtham_user_media") || "[]");
    const updatedCustom = [newItem, ...customItems];
    localStorage.setItem("kavya_gowtham_user_media", JSON.stringify(updatedCustom));
    setMediaList((prev) => [newItem, ...prev]);
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setMediaTitle("");
    setPreviewUrl(null);
    setUploadStatus(null);
    setIsUploading(false);
    setIsUploadOpen(false);
  };

  const handleDeleteCustomMedia = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const customItems = JSON.parse(localStorage.getItem("kavya_gowtham_user_media") || "[]");
    const updatedCustom = customItems.filter((item: MediaItem) => item.id !== id);
    localStorage.setItem("kavya_gowtham_user_media", JSON.stringify(updatedCustom));

    setMediaList((prev) => prev.filter((item) => item.id !== id));
    if (selectedMedia?.id === id) setSelectedMedia(null);
  };

  const filteredMedia = mediaList.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-20">
      <Navbar />

      {/* Main Header */}
      <section className="py-12 px-6 bg-gradient-to-b from-card to-background text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <Sparkles size={16} />
            <span>Kavya & Gowtham's Memory Vault</span>
            <Heart size={14} fill="currentColor" className="text-love-red animate-pulse-heart" />
          </div>

          <h1 className="font-serif-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Photos & Videos Gallery
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Upload your photos and videos to store them permanently in your memory album and Cloudflare R2 storage!
          </p>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-8 py-4 bg-primary text-primary-foreground text-lg font-serif-display font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-3"
            >
              <Plus size={24} />
              <span>Upload Photo or Video</span>
            </button>

            <button
              onClick={() => setShowR2Config(!showR2Config)}
              className={`px-5 py-3 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                r2WorkerUrl
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cloud size={18} />
              <span>{r2WorkerUrl ? "Cloudflare R2 Linked ☁️" : "Connect Cloudflare R2 Worker"}</span>
            </button>
          </div>

          {/* Cloudflare Worker URL Config Panel */}
          {showR2Config && (
            <div className="max-w-xl mx-auto mt-6 p-5 bg-card border border-sky-500/30 rounded-2xl text-left shadow-lg animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                  <Cloud size={18} className="text-sky-500" />
                  <span>Cloudflare R2 Bucket: kavya-gowtham-memories</span>
                </div>
                <button
                  onClick={() => setIsR2ModalOpen(true)}
                  className="text-xs text-sky-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  View Setup Guide
                </button>
              </div>

              <p className="text-xs text-muted-foreground font-body mb-3">
                Paste your deployed Cloudflare Worker URL below. Once saved, all photos and videos uploaded will be stored directly into your Cloudflare R2 bucket (<code className="text-sky-500">{R2_CONFIG.publicDevUrl}</code>)!
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://your-worker-name.workers.dev/upload"
                  value={r2WorkerUrl}
                  onChange={(e) => handleSaveR2WorkerUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={() => setShowR2Config(false)}
                  className="px-4 py-2.5 bg-sky-500 text-white font-semibold text-xs rounded-xl hover:bg-sky-600 transition-colors"
                >
                  Save URL
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 px-6 max-w-6xl mx-auto flex items-center justify-between border-b border-border mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveFilter("image")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "image"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon size={16} />
            Photos ({mediaList.filter((m) => m.type === "image").length})
          </button>
          <button
            onClick={() => setActiveFilter("video")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "video"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <VideoIcon size={16} />
            Videos ({mediaList.filter((m) => m.type === "video").length})
          </button>
        </div>

        <span className="text-xs text-muted-foreground font-body hidden sm:inline-block">
          Click any photo or video to view in full screen
        </span>
      </section>

      {/* Media Grid */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        {filteredMedia.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <VideoIcon size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-serif-display text-2xl text-foreground font-bold mb-2">
              No items in this category
            </h3>
            <p className="text-muted-foreground font-body mb-6">
              Upload your first video or photo to populate this gallery!
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:scale-105 transition-transform"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Media Container */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-black/5 relative">
                  {item.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative">
                      <video src={item.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={22} className="ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                        <VideoIcon size={12} /> Video
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  {/* Provider Tag */}
                  {item.storageProvider === "r2" && (
                    <span className="absolute top-3 left-3 bg-sky-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shadow-sm">
                      <Cloud size={10} /> R2 Cloud
                    </span>
                  )}

                  {/* Delete Button for Custom Uploaded Items */}
                  {item.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomMedia(item.id, e)}
                      title="Delete item"
                      className="absolute top-3 right-3 p-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-4 bg-card flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-serif-display font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      {item.dateAdded}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-background border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-fade-in-up">
            <button
              onClick={resetUploadForm}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Upload size={24} />
              </div>
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-foreground">
                  Upload Photo or Video
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  Upload to store in your memory album and Cloudflare R2 cloud
                </p>
              </div>
            </div>

            {uploadStatus ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 animate-bounce" />
                <h4 className="font-serif-display font-bold text-xl text-foreground">
                  {uploadStatus.message}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                {/* File Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  />

                  {previewUrl ? (
                    <div className="relative aspect-video max-h-48 mx-auto rounded-xl overflow-hidden bg-black/10">
                      {mediaType === "video" ? (
                        <video src={previewUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                        Click to change photo/video
                      </span>
                    </div>
                  ) : (
                    <div className="py-6">
                      <Upload size={40} className="mx-auto text-primary mb-3 opacity-80" />
                      <p className="font-semibold text-foreground text-base">
                        Click to choose photo or video
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select any image (JPG, PNG) or video (MP4, MOV)
                      </p>
                    </div>
                  )}
                </div>

                {/* Title / Name Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Tag size={14} /> Name / Title for this memory
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ooty Trip with Kavya ❤️"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-body text-sm"
                  />
                </div>

                {/* Cloudflare Worker URL prompt if missing */}
                {!r2WorkerUrl && (
                  <div className="bg-sky-500/10 p-3.5 rounded-xl border border-sky-500/20 text-xs font-body text-foreground flex items-start gap-2.5">
                    <Cloud size={18} className="text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sky-600 dark:text-sky-400">To store directly in Cloudflare R2 bucket:</span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Paste your Cloudflare Worker URL in settings or click below to view the 1-minute setup guide!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsUploadOpen(false);
                          setIsR2ModalOpen(true);
                        }}
                        className="text-sky-500 hover:underline font-semibold text-[11px] mt-1 block"
                      >
                        Click here to view Cloudflare R2 Setup Guide &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={resetUploadForm}
                    className="px-5 py-2.5 rounded-full border border-border text-muted-foreground font-semibold text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || !mediaTitle.trim() || isUploading}
                    className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Save Memory</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX / PLAYER MODAL */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary p-2 transition-colors"
            >
              <X size={28} />
            </button>

            <div className="w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/50 shadow-2xl">
              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                />
              )}
            </div>

            <div className="mt-4 text-center text-white">
              <h3 className="font-serif-display text-2xl font-bold text-rose-gold">
                {selectedMedia.name}
              </h3>
              <p className="text-xs text-white/70 font-body mt-1 flex items-center justify-center gap-2">
                <span>{selectedMedia.dateAdded}</span>
                {selectedMedia.storageProvider === "r2" && (
                  <span className="bg-sky-500/90 text-white px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                    <Cloud size={10} /> Cloudflare R2 Storage
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* R2 GUIDE MODAL */}
      <R2GuideModal isOpen={isR2ModalOpen} onClose={() => setIsR2ModalOpen(false)} />

      <Footer />
    </div>
  );
};

export default PhotosPage;
