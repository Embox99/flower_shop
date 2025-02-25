"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CartModal from "./CartModal";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useWixClient } from "../hooks/useWixClient";
import { useCartStore } from "../hooks/useCartStore";

const NavIcons = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  //TEPMORARY
  const wixClient = useWixClient();
  const isLoggedIn = wixClient.auth.loggedIn();
  const handleProfile = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    Cookies.remove("refreshToken");
    const { logoutUrl } = await wixClient.auth.logout(window.location.href);
    setIsLoading(false);
    setIsProfileOpen(false);
    router.push(logoutUrl);
  };

  const { cart, counter, getCart } = useCartStore();

  useEffect(() => {
    getCart(wixClient);
  }, [wixClient, getCart]);

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
          <div className="mt-2 cursor-pointer" onClick={handleLogout}>
            {isLoading ? "Logging out" : "Logout"}
          </div>
        </div>
      )}
      <Image
        src="/icons/notification.png"
        alt="cart"
        width={22}
        height={22}
        className="cursor-pointer hidden lg:block w-4 h-4 md:w-5 md:h-5 hover:opacity-50 transition duration-200"
      />
      <div
        className="relative cursor-pointer"
        onClick={() => setIsCartOpen((prev) => !prev)}
      >
        <Image
          src="/icons/cart.png"
          alt="cart"
          width={22}
          height={22}
          className="cursor-pointer w-4 h-4 md:w-5 md:h-5 hover:opacity-50 transition duration-200"
        />
        <div className="absolute -top-4 -right-4 w-5 h-5 bg-lama rounded-full text-white text-sm flex items-center justify-center">
          {counter}
        </div>
      </div>
      {isCartOpen && <CartModal />}
    </div>
  );
};

export default NavIcons;
