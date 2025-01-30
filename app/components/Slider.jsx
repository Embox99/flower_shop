"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: "Summer Sale",
    description: "Sale up to 30%",
    img: "https://images.pexels.com/photos/19825995/pexels-photo-19825995/free-photo-of-woman-hands-holding-flowers.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "/",
    bg: "bg-gradient-to-r from-yellow-50 to-pink-50",
  },
  {
    id: 2,
    title: "Winter Sale",
    description: "Sale up to 30%",
    img: "https://images.pexels.com/photos/6913829/pexels-photo-6913829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    url: "/",
    bg: "bg-gradient-to-r from-pink-50 to-blue-50",
  },
  {
    id: 3,
    title: "Spring Sale",
    description: "Sale up to 30%",
    img: "https://images.pexels.com/photos/16349982/pexels-photo-16349982/free-photo-of-woman-holding-a-bouquet-in-front-of-her-face.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "/",
    bg: "bg-gradient-to-r from-blue-50 to-yellow-50",
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  return (
    <div className="h-[calc(100vh-80px)]">
      <div className="w-max h-full flex transition-all ease-in-out duration-1000">
        {slides.map((slide) => (
          <div
            className={`${slide.bg} w-screen h-full flex flex-col gap-16 xl:flex-row`}
            key={slide.id}
          >
            {/*TEXT CONTAINER */}
            <div className="h-1/2 xl:w-1/2 xl:h-full flex items-center justify-center gap-8 flex-col xl:gap-12 text-center">
              <h2 className="text-xl lg:text-3xl 2xl:text-5xl">
                {slide.description}
              </h2>
              <h1 className="text-5xl lg:text-6xl 2xl:text-8xl font-semibold">
                {slide.title}
              </h1>
              <Link href={slide.url}>
                <button className="rounded-md bg-black text-white py-3 px-4">
                  SHOP NOW
                </button>
              </Link>
            </div>
            {/*IMAGE CONTAINER */}
            <div className="h-1/2 xl:w-1/2 relative xl:h-full">
              <Image
                src={slide.img}
                alt=""
                fill
                sizes="100%"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
