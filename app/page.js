import Image from "next/image";
import Navbar from "./Navbar";
import Banner from "./Banner";

export default function Home() {
  return (
    <main>
      <Banner />
      <Navbar />
      <div className="container"></div>
    </main>
  );
}
