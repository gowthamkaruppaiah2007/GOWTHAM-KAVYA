import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Sparkles } from "lucide-react";

const previewPhotos = [
  { url: "/images/photo1.jpg", caption: "Our Sweet Moments ❤️" },
  { url: "/images/photo2.jpg", caption: "Unforgettable Smiles ✨" },
  { url: "/images/photo3.jpg", caption: "Together Always 💕" },
  { url: "/images/photo4.jpg", caption: "Special Memories 🌸" },
];

const MemoriesGallery = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Memories Album</span>
          </div>
          <p className="font-cursive text-primary text-3xl md:text-4xl mb-2">Our Special Moments</p>
          <h2 className="font-serif-display text-2xl md:text-4xl font-semibold text-foreground">
            Moments That Made Us, Us
          </h2>
        </div>

        {/* 4 Photo Grid Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {previewPhotos.map((photo, index) => (
            <div
              key={index}
              className="reveal group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-border"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="font-cursive text-primary-foreground text-lg">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call To Action Button to Photos Page */}
        <div className="text-center reveal">
          <Link
            to="/photos"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-serif-display font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <ImageIcon size={20} />
            <span>Explore Full Gallery & Upload Photos / Videos</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MemoriesGallery;
