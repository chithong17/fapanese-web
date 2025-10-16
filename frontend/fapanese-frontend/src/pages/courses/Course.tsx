import React from "react";
import ScrollReveal from "../../components/ScrollReveal";
import { Link } from "react-router-dom";
import LogoJPD113 from "../../assets/jpd113.svg";
import LogoJPD123 from "../../assets/jpd123.svg";
import LogoJPD133 from "../../assets/jpd133.svg";
import Footer from "../../components/Footer";

interface Course {
  img: string;
  nameCourse: string;
  price: string;
  level: string;
  code: string;
  title: string;
  description: string;
  description2: string;

  duration: string;
}

const courses: Course[] = [
  {
    nameCourse: "できる日本語 (SƠ)",
    img: LogoJPD113,
    price: "MIỄN PHÍ",
    level: "Cơ bản",
    code: "JPD113",
    title: "JPD113",
    description: "できる日本語! - Tiến bộ nhanh chóng cùng",
    description2: "FAPANESE!",
    duration: "12 tuần",
  },
  {
    nameCourse: "できる日本語 (TRUNG)",

    img: LogoJPD123,
    level: "Trung cấp",
    price: "MIỄN PHÍ",
    code: "JPD123",
    title: "JPD123",
    description: "できる日本語! - Tiến bộ nhanh chóng cùng",
    description2: "FAPANESE!",

    duration: "10 tuần",
  },
  {
    nameCourse: "できる日本語 (CAO)",
    img: LogoJPD133,
    level: "Nâng cao",
    price: "MIỄN PHÍ",
    code: "JPD133",
    title: "JPD133",
    description: "できる日本語! - Tiến bộ nhanh chóng cùng",
    description2: "FAPANESE!",

    duration: "14 tuần",
  },
];

const Course: React.FC = () => {
  return (
    <ScrollReveal>
      <section className="w-full bg-gray-100 py-30 px-6  break-all">
        <div className="max-w-7xl mx-auto grid gap-10">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="relative group bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
            >
              <div className="grid grid-cols-10 items-center p-6 sm:p-3 gap-6">
                {/* Bên phải: hình và button */}
                <div className="col-span-10 sm:col-span-6 relative flex flex-col items-center justify-center space-y-4">
                  {/* Hình ảnh chính */}
                  <img
                    src={course.img}
                    alt={course.title}
                    className="h-[75%] object-cover rounded-2xl shadow-md transition duration-500 -mb-0.5"
                  />

                  {/* SVG caro overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full z-0 pointer-events-none rounded-2xl"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="15"
                        height="15"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="rgba(0,0,0,0.1)" // Màu đen với độ mờ nhẹ
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Bên trái: thông tin khóa học */}
                <div className="col-span-10 sm:col-span-4 text-right space-y-3 px-5 py-5  tracking-wider">
                  <div>
                    <span className="bg-red-500 rounded-2xl px-3 py-1 font-bold text-white">
                      {course.price}
                    </span>
                    <span className="text-green-950 font-semibold text-3xl font-sans">
                      {" "}
                      {course.nameCourse}
                    </span>
                  </div>

                  <h2 className="text-6xl font-bold text-[#023333] font-sans">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {course.description2}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    ⏱ Thời lượng: {course.duration}
                  </p>
                  <div className="flex justify-end">
                    <svg
                      className="w-4 h-4 text-yellow-300 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-300 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-300 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-300 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-300 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      5
                    </p>
                    <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      /
                    </p>
                    <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      5
                    </p>
                    <br />
                  </div>
                  <br />

                  <Link
                    to={`/courses/${course.code}`}
                    className="px-5 py-2 bg-[#80D9E6] text-white rounded-3xl font-bold px-20 "
                  >
                    BẮT ĐẦU HỌC!
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer></Footer>
    </ScrollReveal>
  );
};

export default Course;
