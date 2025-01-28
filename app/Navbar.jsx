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
    <nav className="relative">
      <div className="flex container items-center justify-between mx-auto px-4 md:px-0">
        {/* Mobile Menu Icon */}
        <div className="md:hidden absolute left-0">
          {!navBarOpen ? (
            <button onClick={() => setNavBarOpen(true)}>
              <Bars3Icon className="h-8 w-8" />
            </button>
          ) : (
            <button onClick={() => setNavBarOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Logo */}
        <Link
          href={"/"}
          className="text-m md:text-2xl text-black font-semibold mx-auto md:mx-0"
        >
          Flower Shop
        </Link>

        {/* Desktop Menu */}
        <div className="menu md:block hidden md:w-auto" id="navbar">
          <ul className="flex md:flex-row p-4 md:p-0 mt-0 md:space-x-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink title={link.title} href={link.path} />
              </li>
            ))}
          </ul>
        </div>

        {/* Icons */}
        <NavIcons links={navLinks} />
      </div>

      {/* Mobile Overlay */}
      {navBarOpen ? <MenuOverlay links={navLinks} /> : null}
    </nav>
  );
};

export default Navbar;
