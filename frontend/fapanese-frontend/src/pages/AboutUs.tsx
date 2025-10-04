import React from "react";
import { FaReact, FaDocker } from "react-icons/fa";
import {
  SiTailwindcss,
  SiMysql,
  SiSpringboot,
  SiTypescript,
  SiJavascript,
} from "react-icons/si";
import Footer from "../components/Footer";
import AboutUsBanner from "../assets/abub.jpg";
import AboutUsSide from "../assets/aboutside2.jpg";


const technologies = [
  { icon: <FaReact />, name: "React", color: "text-blue-400" },
  { icon: <SiTypescript />, name: "TypeScript", color: "text-blue-600" },
  { icon: <SiJavascript />, name: "JavaScript", color: "text-yellow-400" },
  { icon: <SiTailwindcss />, name: "TailwindCSS", color: "text-teal-400" },
  { icon: <SiMysql />, name: "MySQL", color: "text-blue-800" },
  { icon: <FaDocker />, name: "Docker", color: "text-blue-500" },
  { icon: <SiSpringboot />, name: "Spring Boot", color: "text-green-500" },
];

const coreValues = [
  {
    title: "Đổi Mới",
    desc: "Chúng tôi khát khao thay đổi cách học tiếng Nhật truyền thống, mang đến sự sáng tạo và trải nghiệm mới mẻ.",
    icon: "",
  },
  {
    title: "Hợp Tác",
    desc: "Chúng tôi tin rằng sức mạnh tập thể sẽ giúp mọi ý tưởng trở nên hiện thực và lan tỏa xa hơn.",
    icon: "",
  },
  {
    title: "Tận Tâm",
    desc: "Người học là trung tâm. Chúng tôi đồng hành và hỗ trợ tận tình trong từng bước phát triển.",
    icon: "",
  },
  {
    title: "Phát Triển Bền Vững",
    desc: "Xây dựng một nền tảng học tập lâu dài, ổn định và có giá trị cho cộng đồng.",
    icon: "",
  },
];

const AboutUs: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen overflow-hidden font-nunito">
      {/* Hero Section */}
      <section>
        <img src={AboutUsBanner} alt="" className="h-[100%] mt-20 "/>
      </section>
  
  

      {/* Technologies Section */}
      <section className="py-28 bg-gradient-to-br from-gray-00 to-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Công Nghệ Chúng Tôi <span  className="text-4xl md:text-5xl font-extrabold text-[#80D9E6]  ">Sử Dụng</span>
          </h2>
          
          <p className="text-lg text-gray-600">
            Chúng tôi lựa chọn những công nghệ tiên tiến để xây dựng một nền tảng
            học tập tối ưu, ổn định và hiện đại.
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-gray-50 to-transparent z-20"></div>
          <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-gray-50 to-transparent z-20"></div>

          <div className="flex space-x-20 animate-marquee hover:[animation-play-state:paused]">
            {[...technologies, ...technologies].map((tech, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center group transform transition-transform hover:scale-110 hover:rotate-3 relative"
              >
                <div
                  className={`${tech.color} text-7xl mb-4 drop-shadow-lg transition-transform z-10`}
                >
                  {tech.icon}
                </div>
                <p className="text-gray-700 font-semibold group-hover:text-blue-600 transition-colors text-lg z-0">
                  {tech.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Giá Trị <span  className="text-4xl md:text-5xl font-extrabold text-[#80D9E6]  ">Cốt Lõi</span>
          </h2>
          <p className="text-lg text-gray-600">
            Đây là kim chỉ nam, giúp chúng tôi luôn vững bước trên hành trình đổi mới giáo dục.
          </p>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
          {coreValues.map((value, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-gray-100 to-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="text-center md:text-left animate-fadeInUp">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Sứ Mệnh Của <span  className="text-5xl md:text-6xl font-extrabold text-[#80D9E6]  ">Chúng Tôi</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Chúng tôi mong muốn mang đến trải nghiệm học tập cá nhân hóa, nơi mà
              <span className="font-semibold text-gray-800"> bất kỳ ai cũng có thể tiếp cận tiếng Nhật</span>{" "}
              một cách dễ dàng và hiệu quả.
              <br />
              <br />
              Học tập không chỉ là tiếp thu kiến thức, mà còn là hành trình
              khám phá bản thân, mở rộng cơ hội và kết nối cộng đồng.
            </p>
            <a
              href="#"
              className="inline-block px-8 py-4 bg-[#80D9E6] text-white font-bold rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              Tìm Hiểu Thêm
            </a>
          </div>

          <div className="relative animate-float">
            <div className="rounded-2xl shadow-2xl overflow-hidden relative z-10">
              <img
                src={AboutUsSide}
                alt="Learning"
                className="rounded-2xl transform transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-blue-300 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>
    


      <Footer />

      {/* Animations */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 30s linear infinite;
            width: max-content;
          }
          @keyframes fadeInUp {
            0% {opacity: 0; transform: translateY(40px);}
            100% {opacity: 1; transform: translateY(0);}
          }
          .animate-fadeInUp {
            animation: fadeInUp 1.5s ease forwards;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default AboutUs;
