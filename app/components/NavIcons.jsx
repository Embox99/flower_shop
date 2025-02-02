"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CartModal from "./CartModal";
import { useRouter } from "next/navigation";

const NavIcons = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  //TEPMORARY

  const isLoggedIn = true;
  const handleProfile = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsProfileOpen((prev) => !prev);
  };
  return (
    <div className="flex gap-3 xl:gap-6 relative">
      <Image
        src="/icons/profile.png"
        alt="cart"
        width={22}
        height={22}
        className="cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:opacity-50 transition duration-200"
        onClick={handleProfile}
      />
      {isProfileOpen && (
        <div className=" z-20 absolute p-4 rounded-md top-12 left-0 text-sm bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <Link href="/">Profile</Link>
          <div className="mt-2 cursor-pointer hover:text-gray-500">Log out</div>
        </div>
      )}
      <Image
        src="/icons/notification.png"
        alt="cart"
        width={22}
        height={22}
        className="cursor-pointer hidden lg:block w-4 h-4 md:w-5 md:h-5 hover:opacity-50 transition duration-200"
      />
      <div className="relative cursor-poinet">
        <Image
          src="/icons/cart.png"
          alt="cart"
          width={22}
          height={22}
          className="cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:opacity-50 transition duration-200"
          onClick={() => setIsCartOpen((prev) => !prev)}
        />
        <div className="absolute -top-4 -right-4 w-5 h-5 bg-lama rounded-full text-white text-sm flex items-center justify-center">
          2
        </div>
      </div>
      {isCartOpen && <CartModal />}
    </div>
  );
};

export default NavIcons;
