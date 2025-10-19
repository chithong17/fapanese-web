import React, { useState, useEffect } from "react";
import ScrollReveal from "../../components/ScrollReveal";
import { Link } from "react-router-dom";
import LogoJPD113 from "../../assets/jpd113.svg";
import LogoJPD123 from "../../assets/jpd123.svg";
import LogoJPD133 from "../../assets/jpd133.svg";
import Footer from "../../components/Footer";

// Map các chuỗi tên logo từ API sang các biến đã import
const logoMap: { [key: string]: string } = {
  LogoJPD113: LogoJPD113,
  LogoJPD123: LogoJPD123,
  LogoJPD133: LogoJPD133,
};

// Interface cho component (dữ liệu đã được chuyển đổi)
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

// Interface cho dữ liệu thô từ API
interface ApiCourse {
  id: number;
  courseName: string; // Khác với 'nameCourse'
  description: string;
  imgUrl: string; // Khác với 'img' và là chuỗi
  price: string;
  level: string;
  code: string;
  title: string;
  duration: string;
  // API không có 'description2'
}

const Course: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8080/fapanese/api/courses");
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu khóa học");
        }
        const apiData: ApiCourse[] = await response.json();

        // Chuyển đổi dữ liệu từ API sang dạng mà component mong đợi
        const transformedCourses = apiData.map((apiCourse) => ({
          nameCourse: apiCourse.courseName,
          img: logoMap[apiCourse.imgUrl] || "", // Ánh xạ chuỗi imgUrl sang import
          price: apiCourse.price,
          level: apiCourse.level,
          code: apiCourse.code,
          title: apiCourse.title,
          description: apiCourse.description,
          description2: "FAPANESE!", // Thêm description2 bị thiếu
          duration: apiCourse.duration,
        }));

        setCourses(transformedCourses);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Đã xảy ra lỗi không xác định");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component mount

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Lỗi: {error}</div>;
  }

  return (
    <ScrollReveal>
      <section className="w-full bg-gray-100 py-30 px-6 break-all">
        <div className="max-w-7xl mx-auto grid gap-10">
          {courses.map((course, idx) => (
            <div
              key={idx} // Tốt hơn nên dùng course.id hoặc course.code nếu chúng là duy nhất
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
                </div>

                {/* Bên trái: thông tin khóa học */}
                <div className="col-span-10 sm:col-span-4 text-right space-y-3 px-5 py-5 tracking-wider">
                  <div>
                    <span className="bg-red-700 rounded-2xl px-3 py-1 font-bold text-white">
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
                      className="w-4 h-4 text-yellow-400 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-400 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-400 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-400 me-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-yellow-400 me-1"
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
                    className=" py-2 bg-[#80D9E6] text-white rounded-3xl font-bold px-20 "
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