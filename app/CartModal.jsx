"use client";
import React from "react";
import Image from "next/image";

const CartModal = () => {
  const cartItems = true;
  return (
    <div className="w-max absolute p-4 rounded-md shadow-[0_3px_10px_rgb(0,0,0,0.2)] bg-white top-12 right-0 flex flex-col gap-6 z-20 ">
      {!cartItems ? (
        <div className="">Cart is Empty</div>
      ) : (
        <>
          <h2 className="font-semibold text-xl">Shooping Cart</h2>
          {/*LIST*/}
          <div className="flex flex-col gap-8">
            {/*ITEM */}
            <div className="flex gap-4">
              <Image
                src="https://images.pexels.com/photos/30255079/pexels-photo-30255079/free-photo-of-woman-holding-bouquet-of-red-berries-in-outdoor-setting.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                alt=""
                width={72}
                height={96}
                className="object-cover rounded-md"
              />
              <div className="flex flex-col justify-between w-full">
                {/*TOP*/}
                <div className="">
                  {/*TITLE*/}
                  <div className="flex items-center justify-between gap-8">
                    <h3 className="font-semibold">Product Name</h3>
                    <div className="p1 bg-gray-50 rounded-sm">49$</div>
                  </div>
                  {/*DESCRIPTION*/}
                  <div className="text-sm text-gray-500">avaible</div>
                </div>
                {/*BOTTOM*/}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Qty. 2</span>
                  <span className="text-blue-500">Remove</span>
                </div>
              </div>
            </div>
            {/*ITEM */}
            <div className="flex gap-4">
              <Image
                src="https://images.pexels.com/photos/30255079/pexels-photo-30255079/free-photo-of-woman-holding-bouquet-of-red-berries-in-outdoor-setting.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                alt=""
                width={72}
                height={96}
                className="object-cover rounded-md"
              />
              <div className="flex flex-col justify-between w-full">
                {/*TOP*/}
                <div className="">
                  {/*TITLE*/}
                  <div className="flex items-center justify-between gap-8">
                    <h3 className="font-semibold">Product Name</h3>
                    <div className="p1 bg-gray-50 rounded-sm">49$</div>
                  </div>
                  {/*DESCRIPTION*/}
                  <div className="text-sm text-gray-500">avaible</div>
                </div>
                {/*BOTTOM*/}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Qty. 2</span>
                  <span className="text-blue-500">Remove</span>
                </div>
              </div>
            </div>
          </div>
          {/*BOTTOM*/}
          <div>
            <div className="flex items-center justify-between font-semibold">
              <span>Subtotal</span>
              <span>49$</span>
            </div>
            <p className="text-gray-500 text-sm mt-2  mb-4">
              Shipping and taxes calculated at checkout
            </p>
            <div className="flex  justify-between text-sm">
              <button className="rounded-md py-3 px-4 ring-1 ring-gray-300">
                View Cart
              </button>
              <button className="rounded-md py-3 px-4 bg-black text-white">
                Check out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartModal;
