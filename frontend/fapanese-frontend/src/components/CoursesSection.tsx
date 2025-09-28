import React from "react";
import ScrollReveal from "./ScrollReveal";
import { Link } from "react-router-dom";

interface Course {
  level: string;
  code: string;
  title: string;
  description: string;
  duration: string;
}

const courses: Course[] = [
  {
    level: "Cơ bản",
    code: "JPD113",
    title: "Khóa học Cơ bản",
    description:
      "Khóa học toàn diện từ cơ bản với bảng chữ cái, từ vựng, ngữ pháp và speaking",
    duration: "12 tuần",
  },
  {
    level: "Trung cấp",
    code: "JPD123",
    title: "Khóa học Trung cấp",
    description:
      "Khóa học trung cấp tập trung vào từ vựng, ngữ pháp và kỹ năng speaking nâng cao",
    duration: "10 tuần",
  },
  {
    level: "Nâng cao",
    code: "JPD133",
    title: "Khóa học Nâng cao",
    description:
      "Khóa học nâng cao với chương trình học chuyên sâu và luyện thi chứng chỉ",
    duration: "14 tuần",
  },
];

const CoursesSection: React.FC = () => {
  return (
    <ScrollReveal>
      <section className="w-full bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="relative group transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Soft Glow Border */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gray-200/20 blur opacity-50 group-hover:opacity-70 transition duration-500"></div>

              {/* Card Content */}
              <div className="relative bg-white/80 backdrop-blur-md border border-gray-200 p-8 rounded-3xl shadow-lg flex flex-col justify-between h-full text-center transition-all duration-500">
                <div>
                  <p className="text-gray-900 font-extrabold text-4xl mt-1">
                    {course.code}
                  </p>
                  <h2 className="mt-3 text-2xl font-extrabold text-gray-800">
                    {course.title}
                  </h2>
                  <p className="mt-3 text-gray-700">{course.description}</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {course.duration}
                  </p>
                </div>

                <div className="mt-6">
                  <a
                    href={`/courses/${course.code}`}
                    className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow hover:bg-gray-700 transition"
                  >
                    Bắt đầu học
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ScrollReveal>
  );
};

export default CoursesSection;
