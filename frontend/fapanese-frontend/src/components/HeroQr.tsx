
import banner from "../assets/bannerfa.jpg";
import ScrollReveal from "./ScrollReveal";

function HeroQr() {
  return (
    <ScrollReveal>
      <img
        src={banner}
        alt=""
        className="w-full h-140 object-contain "
      />
    </ScrollReveal>
  );
}

export default  HeroQr;
