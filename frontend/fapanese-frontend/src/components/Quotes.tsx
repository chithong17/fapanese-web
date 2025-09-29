
import qt from "../assets/quoste.png";
import ScrollReveal from "./ScrollReveal";

function Quotes() {
  return (
    <ScrollReveal>
      <img
        src={qt}
        alt="Quotes"
        className="w-full h-215 object-contain drop-shadow-2xl"
      />
    </ScrollReveal>
  );
}

export default Quotes;
