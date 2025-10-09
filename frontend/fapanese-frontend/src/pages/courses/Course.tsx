import React from "react";
import ScrollReveal from "../../components/ScrollReveal";
import { Link } from "react-router-dom";

interface Course {
  price: string;
  code: string;
  title: string;
  description: string;
  duration: string;
}

const courses: Course[] = [
  {
    price: "Cơ bản",
    code: "JPD113",
    title: "Khóa học Cơ bản",
    description:
      "Khóa học toàn diện từ cơ bản với bảng chữ cái, từ vựng, ngữ pháp và speaking.",
    duration: "12 tuần",
  },
  {
    price: "Trung cấp",
    code: "JPD123",
    title: "Khóa học Trung cấp",
    description:
      "Khóa học trung cấp tập trung vào từ vựng, ngữ pháp và kỹ năng speaking nâng cao.",
    duration: "10 tuần",
  },
  {
    price: "Nâng cao",
    code: "JPD133",
    title: "Khóa học Nâng cao",
    description:
      "Khóa học nâng cao với chương trình học chuyên sâu và luyện thi chứng chỉ JLPT.",
    duration: "14 tuần",
  },
];

const Course: React.FC = () => {
  return (
    <ScrollReveal>
      <section className="w-full bg-gray-100 py-30 px-6  break-all">
        <div className="max-w-10xl mx-auto grid gap-10">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="relative group bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2"
            >
              <div className="grid grid-cols-10 items-center p-6 sm:p-8 gap-6">
                {/* Bên phải: hình và button */}
                <div className="col-span-10 sm:col-span-4 flex flex-col items-center justify-center space-y-4">
                  <img
                    // src={courseImg}
                    alt={course.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-2xl shadow-md transition duration-500 hover:scale-105"
                  />
                  
                </div>
                {/* Bên trái: thông tin khóa học */}
                <div className="col-span-10 sm:col-span-6 text-left space-y-3">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                    {course.price}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {course.description}
                  </p>
                  <p className="text-gray-900 font-semibold">
                    ⏱ Thời lượng: {course.duration}
                  </p>
                  <Link
                    to={`/courses/${course.code}`}
                    className="px-5 py-3 bg-[#14a5a5] text-white rounded-xl font-semibold shadow-md hover:bg-[#119090] transition"
                  >
                    Bắt đầu học
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
};

export default Course;
