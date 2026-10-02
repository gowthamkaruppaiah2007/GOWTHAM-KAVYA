const LoveLetter = () => {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-2xl mx-auto reveal">
        <div className="text-center mb-12">
          <p className="font-cursive text-primary text-3xl md:text-4xl mb-4">A Letter For You</p>
          <h2 className="font-serif-display text-2xl md:text-3xl font-semibold text-foreground">
            From Gowtham, With All My Love
          </h2>
        </div>
        <div className="bg-background border border-border rounded-2xl p-8 md:p-12 shadow-sm relative">
          {/* Decorative corner */}
          <div className="absolute top-4 left-4 text-primary/20 text-4xl font-cursive">"</div>
          <div className="absolute bottom-4 right-4 text-primary/20 text-4xl font-cursive rotate-180">"</div>

          <div className="space-y-5 text-muted-foreground font-body text-lg leading-relaxed italic">
            <p className="text-foreground font-serif-display not-italic">
              My Dearest Kavya,
            </p>
            <p>
              Unnai first time paatha moment lendhu, en life la oru different feel start aayiduchu. Adhu just attraction illa… adhu calmness, happiness, and completeness. Nee en life la vandhadhum, ellam konjam konjam ah azhaga maariduchu.
            </p>
            <p>
              Namma share panna chinna chinna moments — adhu dhaan enakku romba periya treasure. Oru simple conversation kuda enakku full day happiness kudukkum. Nee en kooda irukka time la dhaan enakku world full ah irukura maari feel aagum
            </p>
            <p>
              Future la enna nadandhaalum, naan un kooda irukanum. Sandhoshathula kooda, kastathula kooda. Nee siricha naan sirikanum. Nee azhuna naan un kai pidichu ninna maari irukanum.
            </p>
            <p>
              Un kooda irukaradhu oru choice illa… adhu en heart oda decision.

Love pannradhu easy nu ellarum solvaanga… aana unai love pannradhu romba natural ah nadakudhu. En breathing maari.

Nee dhaan en favourite person.
Nee dhaan en peace.
Nee dhaan en forever. ❤️
            </p>
            <p>
              Thank you for choosing me. Thank you for loving me. 
            </p>
            <p className="text-foreground font-serif-display not-italic text-right mt-8">
              Forever and always yours,
              <br />
              <span className="font-cursive text-primary text-3xl">Gowtham</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoveLetter;
