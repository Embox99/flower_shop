import React from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import NavIcons from "./NavIcons";

const navLinks = [
  { path: "1", title: "Flower Bouquets" },
  { path: "2", title: "Potted Plants and Orchids" },
  { path: "3", title: "Products on Sale" },
  { path: "4", title: "Gifts and Sweets" },
];

const Navbar = () => {
  return (
    <nav className="">
      <div className="flex container items-center flex-wrap justify-between mx-auto">
        <Link
          href={"/"}
          className="text-xl md:text-2xl text-black font-semibold"
        >
          Flower Shop
        </Link>

        <div className="menu md:block md:w-auto" id="navbar">
          <ul className="flex md:flex-row p-4 md:p-0  mt-0 md:space-x-8">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink title={link.title} href={link.path} />
              </li>
            ))}
          </ul>
        </div>
        <NavIcons />
      </div>
    </nav>
  );
};

export default Navbar;
