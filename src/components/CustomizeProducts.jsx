import React from "react";
import Link from "next/link";

const CustomizeProducts = () => {
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
      </div>
    </div>
  );
};

export default CustomizeProducts;
