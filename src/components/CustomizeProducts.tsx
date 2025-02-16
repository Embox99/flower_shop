"use client";

import React, { useState, useTransition } from "react";
import TabButton from "./TabButton";
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

const CustomizeProducts = ({ product }: { product: any }) => {
  const [tab, setTab] = useState("shipments");
  const [isPending, startTransition] = useTransition();
  const [selectedOptions, setSelectedOprions] = useState<{
    [key: string]: string;
  }>({});

  const handleTabChange = (id) => {
    startTransition(() => {
      setTab(id);
    });
  };
  const productId = product._id;
  const productVariants = product.variants;
  const productOptions = product.productOptions;

  const handleOptionSelect = (optionType: string, choise: string) => {
    setSelectedOprions((prev) => ({ ...prev, [optionType]: choise }));
  };

  const isVariantInStock = (choices: { [key: string]: string }) => {
    return productVariants.some((variant) => {
      const variantChoices = variant.choices;
      if (!variantChoices) return false;

      return (
        Object.entries(choices).every(
          ([key, value]) => variantChoices[key] === value
        ) &&
        variant.stock?.inStock &&
        variant.stock?.quantity > 0
      );
    });
  };

  const TAB_DATA = [
    {
      title: "Shipments and returns",
      id: "shipments",
      content: (
        <div className="">
          <p>Orders can be made through the website online 24 hours a day</p>
        </div>
      ),
    },
    {
      title: "Description",
      id: "description",
      content: (
        <div className="">
          <p className="mb-5">{product.description}</p>
          <span>Small:10 roses | Medium: 15 roses | Large: 20 roses</span>
        </div>
      ),
    },
  ];

  console.log(selectedOptions);

  return (
    <div>
      <div className="pb-20">
        <div className="md:flex gap-2 text-xs justify-end bm-2 hidden">
          <Link href="">{product.name}</Link>
          <span>/</span>
          <Link href="">{product.ribbon}</Link>
          <span>/</span>
          <Link href="/">Home Page</Link>
        </div>
        <div className="flex flex-col justify-end">
          <h1 className="text-2xl md:text-3xl py-2">{product.name}</h1>
          {product.price?.price === product.price?.discountedPrice ? (
            <h2 className="font-medium text-2xl">{product.price?.price} ILS</h2>
          ) : (
            <div className="flex items-center gap-4">
              <h3 className="text-xl text-gray-500 line-through">
                {product.price?.price} ILS
              </h3>
              <h2 className="font-medium text-2xl">
                {product.price?.discountedPrice} ILS
              </h2>
            </div>
          )}
          {productOptions.map((option) => (
            <div key={option.name} className="py-4 w-3/4 sm:w-1/2">
              <p className="font-semibold text-md md:text-xl mb-2">
                {option.name}:
              </p>
              <div className="flex flex-wrap gap-2">
                {option.choices.map((choice) => {
                  const testSelection = {
                    ...selectedOptions,
                    [option.name]: choice.value,
                  };
                  const isAvailable = isVariantInStock(testSelection);

                  return (
                    <div
                      key={choice.value}
                      className={`px-4 py-2 border rounded cursor-pointer ${
                        selectedOptions[option.name] === choice.value
                          ? "bg-lama text-white"
                          : "bg-gray-100"
                      } ${!isAvailable ? "opacity-50" : "hover:bg-opacity-70 hover:bg-lama"}`}
                      onClick={() =>
                        setSelectedOprions((prev) => ({
                          ...prev,
                          [option.name]: choice.value,
                        }))
                      }
                    >
                      {choice.description}{" "}
                      {!isAvailable ? "(Not in stock)" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

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
      <div className="mt-8 flex flex-row">
        <TabButton
          selectTab={() => handleTabChange("shipments")}
          active={tab == "shipments"}
        >
          Shipments and returns
        </TabButton>
        <TabButton
          selectTab={() => handleTabChange("description")}
          active={tab == "description"}
        >
          Description
        </TabButton>
      </div>
      <div className="mt-8">{TAB_DATA.find((t) => t.id === tab).content}</div>
    </div>
  );
};

export default CustomizeProducts;
