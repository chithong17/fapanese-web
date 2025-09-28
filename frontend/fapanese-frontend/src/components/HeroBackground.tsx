import React from "react";
import bgImage from "../assets/bg.jpg";
import heroImage from "../assets/hero.png";
import heroblImage from "../assets/herobl.png";
import ScrollReveal from "./ScrollReveal";
import hero1 from "../assets/hero1.png";
import hero2 from "../assets/hero2.png";
import hero3 from "../assets/hero3.jpg";
import hero4 from "../assets/hero4.jpg";
import hero5 from "../assets/hero5.png";

const HeroBackground: React.FC = () => {
  return (
    <ScrollReveal>
      <section className="relative w-screen h-[1000px] overflow-hidden flex items-center justify-center">
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
            className="w-200px object-contain drop-shadow-2xl mt-40"
          />

          {/* Hình dưới */}
          <div className="relative">
            <img
              src={heroblImage}
              alt="Hero Bottom"
              className="w-[2000px] object-contain drop-shadow-2xl "
            />

            {/* 4 ô nhỏ chồng lên dưới hình */}
            <div className="absolute  left-1/2 transform -translate-x-1/2 -bottom-20 flex space-x-4 mb-50 -ml-41">
              <img
                src={hero1}
                alt=""
                className="w-[300px] h-auto object-contain drop-shadow-lg rounded-lg"
              />
              <img
                src={hero5}
                alt=""
                className="w-[300px] h-auto object-contain drop-shadow-lg rounded-lg"
              />
              <img
                src={hero3}
                alt=""
                className="w-[300px] h-auto object-contain drop-shadow-lg rounded-lg"
              />
              <img
                src={hero4}
                alt=""
                className="w-[300px] h-auto object-contain drop-shadow-lg rounded-lg"
              />
            </div>
          </div>
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
    </ScrollReveal>
  );
};

export default HeroBackground;
