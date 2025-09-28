import Navbar from "./components/Navbar";
import HeroBackground from "./components/HeroBackground";
import HeroBelow from "./components/HeroBelow";


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

          <HeroBelow/>
        
      </main>
    </div>
  );
}

export default App;
