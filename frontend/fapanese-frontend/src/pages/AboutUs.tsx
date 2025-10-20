import React from "react";
// Import các icons cần thiết
import { FaReact, FaDocker, FaCodeBranch, FaHandsHelping, FaHeart, FaUsers, FaChartLine, FaLightbulb, FaInfinity, FaGlobe, FaQuoteRight, FaAngleDoubleDown, FaChevronRight, FaRegStar } from "react-icons/fa";
import {
  SiTailwindcss,
  SiMysql,
  SiSpringboot,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiFigma,
} from "react-icons/si";

// Giả định component Footer tồn tại
// import Footer from "../components/Footer"; 

// =======================================================
// FAKE URLs CHO ASSETS (GIỮ NGUYÊN)
// =======================================================
const AboutUsBanner = "https://picsum.photos/seed/ultra_elite_sky/1600/900"; 
const AboutUsSide = "https://picsum.photos/seed/ultra_elite_team/800/1000";
const Avatar1 = "https://i.pravatar.cc/150?img=68"; 
const Avatar2 = "https://i.pravatar.cc/150?img=52";
// =======================================================

// CẤU HÌNH MÀU SẮC ULTRA-ELITE 
const PRIMARY_HEX = "#007B8A"; 
const PRIMARY_LIGHT = "#00B8D9"; 
const ACCENT_COLOR_TEXT = "text-[#007B8A]";
const BACKGROUND_LIGHT = "#F5F7FA"; 
const BACKGROUND_DARK = "#FFFFFF"; 
const CARD_BG = "bg-white"; 
const TEXT_DARK = "text-gray-900";
const TEXT_MEDIUM = "text-gray-600";

// CẤU HÌNH MÀU GRADIENT & HOVER 
const GRADIENT_FROM = "#9bced5";
const GRADIENT_TO = "#9cdfe8";
const BUTTON_GRADIENT = `bg-gradient-to-r from-[${GRADIENT_FROM}] to-[${GRADIENT_TO}] text-gray-800`;
const BUTTON_HOVER_STYLE = `hover:shadow-3xl hover:shadow-cyan-400/50 hover:scale-[1.05] hover:from-[#7fb6c0] hover:to-[#81c7d2]`;


const technologies = [
  { icon: <FaReact />, name: "React", color: "text-blue-500" },
  { icon: <SiTypescript />, name: "TypeScript", color: "text-blue-600" },
  { icon: <SiJavascript />, name: "JavaScript", color: "text-yellow-500" },
  { icon: <SiTailwindcss />, name: "TailwindCSS", color: "text-cyan-600" },
  { icon: <SiMysql />, name: "MySQL", color: "text-blue-900" },
  { icon: <FaDocker />, name: "Docker", color: "text-blue-700" },
  { icon: <SiSpringboot />, name: "Spring Boot", color: "text-green-600" },
  { icon: <SiNodedotjs />, name: "Node.js", color: "text-green-700" },
  { icon: <FaGlobe />, name: "Cloud Native", color: "text-indigo-600" },
];

const coreValues = [
  { title: "Đổi Mới Tối Thượng", desc: "Vượt lên mọi giới hạn, kiến tạo giải pháp giáo dục thế hệ mới.", icon: <FaLightbulb /> },
  { title: "Văn Hóa Hợp Tác", desc: "Sức mạnh từ sự tin tưởng. Mọi ý tưởng đều được phát triển tối đa.", icon: <FaHandsHelping /> },
  { title: "Trải Nghiệm Cá Nhân", desc: "Đồng hành 1:1, hỗ trợ tận tâm để đảm bảo hiệu quả cao nhất.", icon: <FaHeart /> },
  { title: "Tầm Nhìn Bền Vững", desc: "Xây dựng nền tảng lâu dài, ổn định, mang lại giá trị vĩnh cửu.", icon: <FaInfinity /> },
];

const statistics = [
  { number: "350K+", label: "Người học toàn cầu", icon: <FaUsers className="text-2xl" /> }, 
  { number: "99.99%", label: "Tỉ lệ hài lòng", icon: <FaChartLine className="text-2xl" /> }, 
  { number: "12+", label: "Đối tác chiến lược", icon: <FaCodeBranch className="text-2xl" /> }, 
];

// Mini Component cho Tech Card (Smooth Lift + Skew on Hover)
const TechCard: React.FC<typeof technologies[0]> = ({ icon, name, color }) => (
  <div
    className={`${CARD_BG} flex flex-col items-center text-center group transform transition-all duration-700 hover:scale-[1.08] hover:skew-y-1 p-6 rounded-xl border border-gray-100 cursor-pointer shadow-lg hover:shadow-2xl`}
    style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
  >
    <div
      className={`${color} text-6xl mb-3 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg`} 
    >
      {icon}
    </div>
    <p className={`${TEXT_DARK} font-extrabold text-lg mt-2 whitespace-nowrap`}> 
      {name}
    </p>
  </div>
);

// Mini Component cho Value Card - Gradient Bottom Border + Subtle Depth
const GradientDepthValueCard: React.FC<typeof coreValues[0]> = ({ title, desc, icon }) => (
  <div
    className="group transform transition-all duration-700 p-7 rounded-xl relative overflow-hidden bg-white hover:translate-y-[-10px] cursor-pointer shadow-xl hover:shadow-2xl hover-gradient-border"
    // SỬA LỖI TẠI ĐÂY: Loại bỏ khoảng trắng giữa 'transitionTiming' và 'Function'
    style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} 
  >
    <div className={`text-5xl mb-3 ${ACCENT_COLOR_TEXT} relative z-10 transition-transform duration-500 group-hover:scale-[1.05]`}> 
      {icon}
    </div>
    <h3 className={`text-xl font-black ${TEXT_DARK} mb-2 relative z-10 underline-hover-gradient pb-2`}> 
      {title}
    </h3>
    <p className={`text-base ${TEXT_MEDIUM} relative z-10 font-light`}>{desc}</p> 
    <FaChevronRight className={`${ACCENT_COLOR_TEXT} absolute bottom-5 right-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xl`} />
  </div>
);

// Component Testimonial (Clean White + Subtle Shadow)
const TestimonialCard: React.FC<{ quote: string; name: string; title: string; avatar: string }> = ({ quote, name, title, avatar }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg relative border border-gray-100 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl"
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
    >
        <FaQuoteRight className={`${ACCENT_COLOR_TEXT} text-4xl absolute top-6 right-6 opacity-5`} /> 
        <p className={`text-lg italic ${TEXT_MEDIUM} mb-5 mt-6 relative z-10 leading-relaxed font-light`}>"{quote}"</p> 
        <div className="flex items-center mt-5 border-t pt-4 border-gray-100">
            {/* Ảnh Avatar với viền Gradient tinh tế */}
            <div className="w-14 h-14 rounded-full p-[3px] gradient-border-avatar mr-4"> 
                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
                <p className={`font-black text-lg ${TEXT_DARK}`}>{name}</p> 
                <p className="text-sm text-gray-500">{title}</p>
            </div>
        </div>
    </div>
);

// Giả định một component Footer đơn giản 
const Footer = () => (
    <footer className={`bg-gray-800 text-white py-12`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-base font-light">© 2024 Fapanese Elite. All rights reserved. | Ultra-Elite Design.</p>
        </div>
    </footer>
);


const AboutUs: React.FC = () => {
  return (
    <div className={`bg-[${BACKGROUND_LIGHT}] min-h-screen overflow-hidden font-nunito`}>
      
      {/* Hero Section - Kích thước chữ lớn được điều chỉnh */}
      <section className="relative h-[80vh] overflow-hidden hero-section"> 
        {/* Parallax Layer 1: Background Image */}
        <div className="absolute top-0 left-0 w-full h-full z-0 parallax-bg" style={{ background: 'black' }}>
            <img 
                src={AboutUsBanner} 
                alt="Hero Banner" 
                className="w-full h-full object-cover object-center transition-transform duration-[1500ms] hover:scale-105" 
                style={{ opacity: 0.8 }}
            />
        </div>

        {/* Parallax Layer 2: Simple Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center"></div>
        
        {/* Parallax Layer 3: Content (Clean Text) */}
        <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex flex-col justify-center items-center z-20 text-center">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-lg font-extrabold uppercase tracking-[0.5em] text-cyan-300 mb-4 animate-fadeInUp delay-500"> 
                    SỨ MỆNH TINH HOA
                </p>
                <h1 className={`text-7xl md:text-[100px] font-black uppercase tracking-[0.1em] text-white leading-none mb-6 animate-fadeInUp delay-700`} 
                    style={{ 
                        textShadow: `0 8px 30px rgba(0, 0, 0, 1)`,
                    }}
                >
                    VỀ CHÚNG TÔI
                </h1>
                <p className="text-xl font-extrabold uppercase tracking-[0.3em] text-gray-200 mt-5 max-w-4xl mx-auto animate-fadeInUp delay-[900ms]"> 
                    TẦM VÓC TOÀN CẦU, GIÁ TRỊ VĨNH CỬU
                </p>
                <a href="#about-content" className="inline-block mt-12 text-white hover:text-[#9cdfe8] transition duration-500"> 
                    <FaAngleDoubleDown className="text-5xl drop-shadow-xl animate-bounce-slow" /> 
                </a>
            </div>
        </div>
      </section>

      {/* About Section - Giảm Padding */}
      <section id="about-content" className={`py-32 px-6 bg-[${BACKGROUND_LIGHT}] relative overflow-hidden`}> 
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"> 
            <div className="lg:col-span-7 animate-fadeInLeft delay-300">
                <p className="text-md font-extrabold uppercase tracking-[0.4em] ${ACCENT_COLOR_TEXT} mb-2">
                    TẦM NHÌN & SỨ MỆNH
                </p>
                <h2 className={`text-4xl md:text-6xl font-black ${TEXT_DARK} leading-tight mb-8`}> 
                    Kiến Tạo <span className={`text-[#00B8D9]`}>Tương Lai</span> Học Tập Toàn Cầu
                </h2>
                {/* Border Left Gradient */}
                <div className="p-8 rounded-xl shadow-2xl transition duration-500 bg-white hover:shadow-3xl border-l-[10px] border-transparent left-gradient-border hover:skew-x-1"> 
                    <FaQuoteRight className={`text-4xl mb-5 ${ACCENT_COLOR_TEXT} opacity-70`} /> 
                    <p className={`text-xl ${TEXT_MEDIUM} mb-5 italic font-semibold leading-relaxed`}> 
                        "Chúng tôi là đối tác kiến tạo sự nghiệp. Cam kết mang lại trải nghiệm cá nhân hóa, hiệu quả và đầy cảm hứng, giúp bạn vượt qua mọi giới hạn."
                    </p>
                    <p className={`text-base ${TEXT_MEDIUM} border-t pt-4 mt-4 border-gray-100`}>
                        Nền tảng của chúng tôi là sự kết hợp hoàn hảo giữa công nghệ tiên tiến (AI-Driven), dữ liệu lớn và phương pháp sư phạm hiện đại.
                    </p>
                </div>
                {/* CTA Button với Gradient và hiệu ứng mượt mà */}
                <a
                    href="#"
                    className={`inline-flex items-center mt-10 px-14 py-4 font-black text-lg rounded-full shadow-2xl transform transition-all duration-700 ${BUTTON_GRADIENT} ${BUTTON_HOVER_STYLE}`} 
                    >
                    Khám Phá Chi Tiết <FaChevronRight className="ml-3 text-xl transition-transform group-hover:translate-x-1" /> 
                </a>
            </div>
            
            {/* Statistics Section (Tối ưu hóa kích thước) */}
            <div className="lg:col-span-5 animate-fadeInRight delay-500 pt-10">
                   <h3 className={`text-2xl font-black ${TEXT_DARK} mb-8 border-b-2 border-gray-300 pb-3 flex items-center`}> 
                    <FaRegStar className={`${ACCENT_COLOR_TEXT} mr-3 text-xl`} /> Đánh Giá Định Lượng
                   </h3>
                <div className="space-y-6"> 
                    {statistics.map((stat, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center p-6 rounded-xl bg-white shadow-xl border border-gray-100 transition duration-700 transform hover:scale-[1.03] hover:shadow-2xl" 
                            style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
                        >
                            {/* Icon Box với Gradient Border */}
                            <div className={`flex items-center text-4xl font-extrabold text-white mr-5 p-3 rounded-lg shadow-lg gradient-border-icon`} 
                                style={{ backgroundColor: PRIMARY_HEX }}
                            >
                                {stat.icon}
                            </div>
                            <div>
                                <p className={`text-4xl font-black ${TEXT_DARK} mb-0`}>{stat.number}</p> 
                                <p className={`text-base uppercase ${TEXT_MEDIUM} font-bold tracking-wider`}>{stat.label}</p> 
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Core Values Section (Giảm Padding) */}
      <section className={`py-32 bg-[${BACKGROUND_DARK}] relative overflow-hidden`}> 
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16"> 
                <p className="text-md font-extrabold uppercase tracking-[0.4em] ${ACCENT_COLOR_TEXT} mb-2">
                    TRIẾT LÝ HOẠT ĐỘNG
                </p>
                <h2 className={`text-4xl md:text-5xl font-black ${TEXT_DARK}`}> 
                    Giá Trị <span className={`text-[#00B8D9]`}>Cốt Lõi</span>
                </h2>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10"> 
            {coreValues.map((value, idx) => (
                <GradientDepthValueCard key={idx} {...value} />
            ))}
          </div>
        </div>
      </section>


      {/* Technologies Section (Giảm Padding) */}
      <section className={`py-24 relative overflow-hidden bg-[#F0F3F6]`}> 
        <div className="max-w-7xl mx-auto text-center mb-10 px-6"> 
            <p className="text-md font-extrabold uppercase tracking-[0.4em] ${ACCENT_COLOR_TEXT} mb-2">
                NỀN TẢNG
            </p>
          <h3 className={`text-4xl md:text-5xl font-black ${TEXT_DARK}`}>
            Công Nghệ <span className={`text-[#00B8D9]`}>Đột Phá</span>
          </h3>
        </div>

        <div className="relative w-full overflow-hidden py-10 border-y-2 border-gray-200"> 
          {/* Fading Edges */}
          <div className={`absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#F0F3F6] to-transparent z-20 pointer-events-none`}></div> 
          <div className={`absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#F0F3F6] to-transparent z-20 pointer-events-none`}></div> 

          <div className="flex space-x-16 animate-marquee-slow"> 
            {[...technologies, ...technologies].map((tech, i) => (
              <TechCard key={i} {...tech} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Giảm Padding) */}
      <section className={`py-32 px-6 bg-[${BACKGROUND_DARK}] relative overflow-hidden`}> 
        <div className="max-w-7xl mx-auto text-center mb-16"> 
            <p className="text-md font-extrabold uppercase tracking-[0.4em] ${ACCENT_COLOR_TEXT} mb-2">
                PHẢN HỒI CHÂN THỰC
            </p>
            <h2 className={`text-4xl md:text-5xl font-black ${TEXT_DARK}`}> 
                Đối Tác <span className={`text-[#00B8D9]`}>Chiến Lược</span>
            </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10"> 
            <TestimonialCard 
                quote="Họ đã vượt xa mọi mong đợi của chúng tôi. Giải pháp của họ không chỉ hiệu quả mà còn thể hiện sự tinh tế trong từng chi tiết. Một trải nghiệm Elite thực sự."
                name="Nguyễn Văn A"
                title="CEO, EdTech Innovations"
                avatar={Avatar1}
            />
            <TestimonialCard 
                quote="Đội ngũ hỗ trợ cực kỳ chuyên nghiệp và tận tâm. Chúng tôi thực sự ấn tượng với chất lượng và sự đổi mới mà họ mang lại trong mọi dự án."
                name="Lê Thị B"
                title="Giám đốc Sản phẩm, Global Learning"
                avatar={Avatar2} 
            />
        </div>
      </section>

      {/* Mission Section (Giảm Padding) */}
      <section className={`py-32 px-6 bg-[#F0F3F6] relative overflow-hidden`}> 
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center"> 
            
          <div className="md:col-span-7 text-center md:text-left animate-fadeInLeft delay-500 order-2 md:order-1">
            <p className="text-lg font-extrabold uppercase tracking-[0.4em] ${ACCENT_COLOR_TEXT} mb-2">Hành trình Khác Biệt</p>
            <h2 className={`text-5xl md:text-6xl font-black ${TEXT_DARK} mb-7 leading-tight`}> 
              Tạo Ra <span className={`text-[#00B8D9]`}>Giá Trị</span> Cho Sự Nghiệp Của Bạn
            </h2>
            <blockquote className={`text-xl ${TEXT_MEDIUM} leading-relaxed mb-8 border-l-4 border-[#00B8D9] pl-6 font-medium italic ${CARD_BG} p-7 rounded-xl shadow-lg`}> 
                <FaQuoteRight className={`${ACCENT_COLOR_TEXT} inline mr-3 text-2xl opacity-80`} /> 
              "Chúng tôi tin vào việc trao quyền. Mỗi người học là một tương lai cần được khai phóng. Chúng tôi tạo ra giá trị khác biệt cho mỗi người học."
            </blockquote>
            
            {/* CTA Button với Gradient và hiệu ứng mượt mà */}
            <a
              href="#"
              className={`inline-flex items-center px-14 py-4 font-black text-lg rounded-full shadow-2xl transform transition-all duration-700 ${BUTTON_GRADIENT} ${BUTTON_HOVER_STYLE}`} 
            >
              Bắt Đầu Ngay <FaChevronRight className="ml-3 text-xl transition-transform group-hover:translate-x-1" /> 
            </a>
          </div>

          {/* Khối Ảnh - Smooth Depth Rotation */}
          <div className="relative md:col-span-5 animate-fadeInRight delay-700 order-1 md:order-2">
            <div 
              className="rounded-[40px] p-[5px] gradient-border-wrap relative z-10 shadow-3xl transition duration-1000 hover:shadow-4xl hover:scale-[1.03] hover:rotate-[-0.5deg]" 
              style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            >
              <img
                src={AboutUsSide}
                alt="Learning"
                className="w-full h-auto object-cover rounded-[35px] transform transition-transform hover:scale-[1.05] duration-1000" 
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* CUSTOM CSS (Đã kiểm tra và tối ưu hóa) */}
      <style>
        {`
          /* FONT CUSTOM */
          @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');
          .font-nunito {
            font-family: 'Nunito', sans-serif;
          }

          /* HERO SECTION - PARALLAX */
          .hero-section {
            perspective: 1px;
            transform-style: preserve-3d;
            overflow-y: auto;
            overflow-x: hidden;
          }
          .parallax-bg {
            transform: translateZ(-1px) scale(2); 
          }

          /* CUSTOM GRADIENT STYLES (Đã kiểm tra và giữ nguyên độ tinh tế) */
          .left-gradient-border {
            border-image-source: linear-gradient(to bottom, ${GRADIENT_FROM}, ${GRADIENT_TO});
            border-image-slice: 1;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          }

          .gradient-border-icon {
              border: 3px solid transparent; 
              background-image: linear-gradient(white, white), 
                                linear-gradient(to right, ${GRADIENT_FROM}, ${GRADIENT_TO});
              background-origin: border-box;
              background-clip: content-box, border-box;
          }

          .gradient-border-avatar {
              background-image: linear-gradient(to right, ${GRADIENT_FROM}, ${GRADIENT_TO});
              padding: 4px; 
              box-shadow: 0 5px 15px rgba(0, 123, 138, 0.2);
          }
          
          .gradient-border-wrap {
            background: linear-gradient(45deg, ${GRADIENT_FROM}, ${GRADIENT_TO});
            border-radius: 40px; 
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          }


          /* HOVER GRADIENT BORDER cho Value Card */
          .underline-hover-gradient {
              position: relative;
          }
          .underline-hover-gradient:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0;
              height: 3px;
              background: linear-gradient(to right, ${GRADIENT_FROM}, ${GRADIENT_TO});
              transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .underline-hover-gradient:hover:after {
              width: 50%;
          }

          .hover-gradient-border {
              position: relative;
          }
          .hover-gradient-border:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 4px;
              background: linear-gradient(to right, ${GRADIENT_FROM}, ${GRADIENT_TO});
              opacity: 0;
              transition: opacity 0.5s ease;
          }
          .hover-gradient-border:hover:after {
              opacity: 1;
          }


          /* ANIMATION MARQUEE TỐC ĐỘ CHẬM HƠN (Giữ nguyên) */
          @keyframes marquee-slow { 
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-slow {
            display: flex;
            animation: marquee-slow 40s linear infinite;
            width: max-content;
          }
          .animate-marquee-slow:hover {
            animation-play-state: paused;
          }
          
          /* FADE IN (Giữ nguyên tốc độ mượt) */
          @keyframes fadeInUp {
            0% {opacity: 0; transform: translateY(30px) translateZ(0);} 
            100% {opacity: 1; transform: translateY(0) translateZ(0);}
          }
          .animate-fadeInUp {
            animation: fadeInUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }

          @keyframes fadeInLeft {
            0% {opacity: 0; transform: translateX(-40px);} 
            100% {opacity: 1; transform: translateX(0);}
          }
          .animate-fadeInLeft {
            animation: fadeInLeft 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }

          @keyframes fadeInRight {
            0% {opacity: 0; transform: translateX(40px);} 
            100% {opacity: 1; transform: translateX(0);}
          }
          .animate-fadeInRight {
            animation: fadeInRight 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }

          /* SIMPLE BOUNCE CHO DẤU MŨI TÊN */
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); } 
          }
          .animate-bounce-slow {
              animation: bounce-slow 2.5s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AboutUs;