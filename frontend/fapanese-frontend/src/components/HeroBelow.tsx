
import ScrollReveal from "./ScrollReveal";

function HeroBelow() {
  return (
    
    
    <div>
      {/* Section 1: Tiêu đề + mô tả */}
      <ScrollReveal>
        <section className="h-80 w-full py-16 px-6 bg-white mt-10">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="title title-jp text-[30px] mb-6 font-sans whitespace-nowrap">
            AIを活用した最新の日本語学習法で、日本語と日本文化を素早く学びましょう。
          </h1>

          <h2 className="font-extrabold text-[40px] text-gray-800 whitespace-nowrap">
            Học tiếng Nhật hiện đại với trí tuệ AI - FAPANESE
          </h2>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal>
        {/* Section 2: 4 cột với nền xanh */}
      <section className="w-full bg-[#80D9E6] py-16 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="relative group">
            <div
              className="absolute -inset-0.5 bg-gradient-to-r from-white via-[#4FB7D4] to-[#1E88A8] 
                      rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-500"
            ></div>
            <div
              className="relative bg-white/10 backdrop-blur-xl border border-white/30 
                      p-6 rounded-2xl shadow-xl text-center"
            >
              <h2
                className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-200 
                       bg-clip-text text-transparent"
              >
                Cùng với FAPANESE
              </h2>
              <p className="mt-3 text-xl font-extrabold text-black">BẠN CÓ THỂ?</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group">
            <div
              className="absolute -inset-0.5 bg-gradient-to-r from-white via-[#4FB7D4] to-[#1E88A8] 
                      rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-500"
            ></div>
            <div
              className="relative bg-white/10 backdrop-blur-xl border border-white/30 
                      p-6 rounded-2xl shadow-xl text-center"
            >
              <h2
                className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-200 
                       bg-clip-text text-transparent"
              >
                15’ mỗi ngày
              </h2>
              <p className="mt-3 text-xl font-extrabold text-black">
                Đỗ JLPT - Điểm cao
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group">
            <div
              className="absolute -inset-0.5 bg-gradient-to-r from-white via-[#4FB7D4] to-[#1E88A8] 
                      rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-500"
            ></div>
            <div
              className="relative bg-white/10 backdrop-blur-xl border border-white/30 
                      p-6 rounded-2xl shadow-xl text-center"
            >
              <h2
                className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-200 
                       bg-clip-text text-transparent"
              >
                Vừa học
              </h2>
              <p className="mt-3 text-xl font-extrabold text-black">Vừa vui</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative group">
            <div
              className="absolute -inset-0.5 bg-gradient-to-r from-white via-[#4FB7D4] to-[#1E88A8] 
                      rounded-2xl blur opacity-60 group-hover:opacity-90 transition duration-500"
            ></div>
            <div
              className="relative bg-white/10 backdrop-blur-xl border border-white/30 
                      p-6 rounded-2xl shadow-xl text-center"
            >
              <h2
                className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-200 
                       bg-clip-text text-transparent"
              >
                Giải pháp tiếng Nhật
              </h2>
              <p className="mt-3 text-xl font-extrabold text-black">
                Cho doanh nghiệp
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}

export default HeroBelow;
