import React from "react";
import Link from "next/link";

const NavLink = ({ title, href }) => {
  return (
    <Link
      href={href}
      className="block cursor-pointer sm:text-l text-black hover:text-[#ADB7BE]"
    >
      {title}
    </Link>
  );
};

export default NavLink;
