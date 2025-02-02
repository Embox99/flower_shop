import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div>
      {/*TOP */}
      <div>
        {/*LEFT */}
        <div className="w-1/4">
          <Link
            href={"/"}
            className="text-sm md:text-lg tracking-wide text-black font-semibold"
          >
            Flower Shop
          </Link>
          <p>Adress</p>
          <span className="font-semibold">mail@gmail.com</span>
          <span className="font-semibold">+972141414</span>
          <div className="flex gap-6">
            <Image src="/images/facebook.png" alt="" width={16} height={16} />
            <Image src="/images/instagram.png" alt="" width={16} height={16} />
            <Image src="/images/youtube.png" alt="" width={16} height={16} />
          </div>
        </div>
        {/*CENTER */}
        <div className="w-1/2"></div>
        {/*RIGHT */}
        <div className="w-1/4"></div>
      </div>
      {/*BOTTOM */}
      <div></div>
    </div>
  );
};

export default Footer;
