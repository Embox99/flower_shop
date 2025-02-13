"use client";
import React, { useState } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import NavIcons from "./NavIcons";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import MenuOverlay from "./MenuOverlay";

const navLinks = [
  { path: "1", title: "Flower Bouquets" },
  { path: "2", title: "Potted Plants and Orchids" },
  { path: "3", title: "Products on Sale" },
  { path: "4", title: "Gifts and Sweets" },
];

const Navbar = () => {
  const [navBarOpen, setNavBarOpen] = useState(false);

  return (
    <nav className="relative px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 mb-3 md:mb-5">
      <div className="flex items-center justify-between mx-auto px-4 md:px-0">
        {/* Mobile Menu Icon */}
        <div className="lg:hidden">
          <button onClick={() => setNavBarOpen(!navBarOpen)}>
            {!navBarOpen ? (
              <Bars3Icon className="h-8 w-8" />
            ) : (
              <XMarkIcon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Logo */}
        <Link
          href={"/"}
          className="text-sm md:text-lg tracking-wide text-black font-semibold"
        >
          Flower Shop
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:w-auto space-x-8 text-m lg:text-lg">
          {navLinks.map((link) => (
            <NavLink key={link.path} title={link.title} href={link.path} />
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center md:px-6">
          <NavIcons />
        </div>
      </div>

      {/* Mobile Overlay */}
      {navBarOpen && <MenuOverlay links={navLinks} />}
    </nav>
  );
};

export default Navbar;
