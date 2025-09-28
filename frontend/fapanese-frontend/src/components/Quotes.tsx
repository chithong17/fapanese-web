import React from "react";
import qt from "../assets/quoste.png";
import ScrollReveal from "./ScrollReveal";

function Quotes() {
  return (
    <ScrollReveal>
      <img
        src={qt}
        alt="Quotes"
        className="w-full h-200 object-contain drop-shadow-2xl mt-10"
      />
    </ScrollReveal>
  );
}

export default Quotes;
