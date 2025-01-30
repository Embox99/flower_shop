import Image from "next/image";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Slider from "./components/Slider";

export default function Home() {
  return (
    <main>
      <Banner />
      <Navbar />
      <div className="container">
        <Slider />
      </div>
    </main>
  );
}
