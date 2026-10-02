import { Heart } from "lucide-react";

const reasons = [
  "Konjam kova kaari dhaan… aana andha kovam kuda enakku romba pidikkum.",
  "Nee enaku kedacha varam thango",
  "Nee avlo alagu,enaku nee tha alagu nee mattu tha alagu",
  "Nee enna care pannikerathu enaku en amma,paati care pandra maari iruku",
  "nee ennoda pokkisam",
  "Naan haircut panna kooda first nee dhaan notice pannuva.",
  "College first year lendhu ippo varaikum namma share pannina moments priceless.",
  "Nee vandhadhum en life la happiness double aayiduchu.",
  "Reason venuma? Nee dhaan Kavya… adhu podhum.",
  "Un presence dhaan en life la biggest gift. Nee illana indha happiness irukathu.",
];

const ReasonsILoveYou = () => {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 reveal">
          <p className="font-cursive text-primary text-3xl md:text-4xl mb-4">From My Heart</p>
          <h2 className="font-serif-display text-2xl md:text-3xl font-semibold text-foreground">
            10 Reasons Why I Love You
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="reveal group relative bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Heart
                    size={18}
                    className="text-primary group-hover:scale-110 transition-transform"
                    fill="currentColor"
                  />
                </div>
                <div>
                  <span className="font-cursive text-rose-gold text-xl mr-2">
                    {index + 1}.
                  </span>
                  <span className="text-muted-foreground font-body leading-relaxed">
                    {reason}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReasonsILoveYou;
