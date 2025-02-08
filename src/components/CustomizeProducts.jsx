"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const items = [
  {
    id: "1",
    url: "https://images.pexels.com/photos/30586104/pexels-photo-30586104/free-photo-of-elegant-dining-scene-with-red-wine-and-glass.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "",
  },
  {
    id: "2",
    url: "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    href: "",
  },
  {
    id: "3",
    url: "https://images.pexels.com/photos/1854664/pexels-photo-1854664.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "",
  },
  {
    id: "4",
    url: "https://images.pexels.com/photos/1854664/pexels-photo-1854664.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "",
  },
  {
    id: "5",
    url: "https://images.pexels.com/photos/1854664/pexels-photo-1854664.jpeg?auto=compress&cs=tinysrgb&w=800",
    href: "",
  },
];

const TAB_DATA = [
  {
    title: "Shipments and returns",
    id: "shipments",
    content: <div className=""></div>,
  },
  {
    title: "Description",
    id: "description",
    content: <div className=""></div>,
  },
];

const CustomizeProducts = () => {
  const [tab, setTab] = useState("shipments");

  return (
    <div>
      <div className="pb-20">
        <div className="md:flex gap-2 text-xs justify-end bm-2 hidden">
          <Link href="">Light My Fire</Link>
          <span>/</span>
          <Link href="">Boquets</Link>
          <span>/</span>
          <Link href="">Home Page</Link>
        </div>
        <div className="flex flex-col justify-end">
          <h1 className="text-2xl md:text-3xl py-2">Light my Fire</h1>
          <p className="text-xl">120$</p>
          <div className="flex py-4 w-3/4 sm:w-1/2">
            <p className="font-semibold text-md md:text-xl w-1/4">Size:</p>
            <select
              name="size"
              id=""
              className="ring-2 ring-slate-300 rounded-sm w-3/4"
            >
              <option>Select an option</option>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
          <button className="bg-lama font-semibold text-white py-2 w-3/4 sm:w-1/2 rounded-md hover:bg-[#3BB7B5] transition-colors duration-300">
            Add to Cart
          </button>
        </div>
      </div>
      <div>
        <h1 className="text-2xl py-2">To create the perfect gift!</h1>
        <p className="text-lg">Complementary products to choose from:</p>
        <div className="flex justify-between mt-8 gap-4 flex-wrap sm:flex-nowrap">
          {items.map((item, i) => (
            <div className="w-1/4 h-32 relative cursor-pointer" key={item.id}>
              <Link href={item.href}>
                <Image
                  src={item.url}
                  fill
                  sizes="20vw"
                  alt=""
                  className="object-cover rounded-md"
                />
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <span className="text-lg font-semibold">Share:</span>
          <div className="flex mt-2 gap-4">
            <Image src="/images/twitter.png" alt="" width={20} height={20} />
            <Image src="/images/telegram.png" alt="" width={20} height={20} />
            <Image
              src="/images/facebook-share.png"
              alt=""
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProducts;
