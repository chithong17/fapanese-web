import React from "react";
import bgImage from "../assets/bg.jpg";
import heroImage from "../assets/hero.png";
import heroblImage from "../assets/herobl.png";

const HeroBackground: React.FC = () => {
  return (
    <section className="relative w-screen h-[800px] overflow-hidden flex items-center justify-center">
      {/* Background image mờ */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 filter blur-sm"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      ></div>

      {/* Overlay xanh #80D9E6 phủ ảnh nền */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#80D9E6",
          opacity: 0.85,
        }}
      ></div>

  <div className="relative z-10 flex flex-col items-center text-center text-white px-4">
  {/* Hình trên */}
  <img
    src={heroImage}
    alt="Hero"
    className="w-200px  object-contain drop-shadow-2xl -mt-70"
  />

  {/* Hình dưới luôn ở cuối hero */}
  <img
    src={heroblImage}
    alt="Hero"
    className="w-280px  object-contain drop-shadow-2xl absolute -bottom-100"
  />
</div>


      <br />
      
      {/* <div className="relative z-10 flex flex-col items-center text-center text-white px-4">
        <img
          src={heroblImage}
          alt="Hero"
          className="w-250px h-auto object-contain drop-shadow-2xl -mt-70"
        />
      </div> */}
      {/* <div>
        <div>
            <h3 className="title title-jp text-md mb-3">知識への投資は最高の利益をもたらす</h3>
        </div>
      </div> */}
    </section>
    
  );
};

export default HeroBackground;
