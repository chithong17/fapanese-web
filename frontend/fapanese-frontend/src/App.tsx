import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";


function App() {
  return (
    <div>
      {/* Navbar cố định trên cùng */}
      <Navbar />

      {/* Nội dung chính */}
      <main className="">
        {/* Hero background section */}
        <HeroBackground />

        {/* Hero navbar (ví dụ như menu riêng cho Hero)
        <HeroNavbar /> */}


        {/* Tiêu đề demo
        <h1 className="text-3xl font-bold mt-8">Xin chào từ Fapanese!</h1> */}
      </main>
    </div>
  );
}

export default App;
