import Link from "next/link";
import Image from "next/image";
import React from "react";
import DOMPurify from "isomorphic-dompurify";
import Pagination from "./Pagination";
import { wixClientServer } from "../lib/wixClientServer";
import { products } from "@wix/stores";

const PRODUCT_PER_PAGE = 4;

const ProductList = async ({
  categoryId,
  limit,
  searchParams: rawSearchParams,
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  const searchParams = await rawSearchParams;
  const wixClient = await wixClientServer();
  const productQuery = wixClient.products
    .queryProducts()
    .startsWith("name", searchParams?.name || "")
    .eq("collectionIds", categoryId)
    .gt("priceData.price", searchParams?.min || 0)
    .lt("priceData.price", searchParams?.max || 999999)
    .limit(limit || PRODUCT_PER_PAGE)
    .skip(
      searchParams?.page
        ? parseInt(searchParams.page) * (limit || PRODUCT_PER_PAGE)
        : 0
    );
  const res = await productQuery.find();

  const [sortType, sortByRaw] = (searchParams?.sort || "").split(" ");
  let sortedItems = res.items;

  if (sortByRaw === "price") {
    sortedItems = [...res.items].sort((a, b) => {
      const priceA = a.priceRange?.minValue || 0;
      const priceB = b.priceRange?.minValue || 0;
      return sortType === "asc" ? priceA - priceB : priceB - priceA;
    });
  }

  return (
    <div className="mt-12 flex gap-8 gap-y-16 justify-between flex-wrap">
      {sortedItems.map((product: products.Product) => (
        <Link
          href={"/" + product.slug}
          className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
          key={product._id}
        >
          <div className="relative w-full h-80">
            <Image
              src={
                product.media?.mainMedia?.image?.url ||
                "https://images.pexels.com/photos/6913829/pexels-photo-6913829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              }
              alt=""
              fill
              sizes="25vw"
              className="absolute objet-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
            />
            {product.media?.items && (
              <Image
                src={
                  product.media?.items[1]?.image.url ||
                  "https://images.pexels.com/photos/6913829/pexels-photo-6913829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt=""
                fill
                sizes="25vw"
              />
            )}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{product.name}</span>
            <span className="font-semibold">
              {product.priceData?.price} {product.priceData?.currency}
            </span>
          </div>
          {product.additionalInfoSections && (
            <div
              className="text-sm text-gray-500"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  product.additionalInfoSections.find(
                    (section: any) => section.title === "shortDesc"
                  )?.description || ""
                ),
              }}
            ></div>
          )}
          <button className="rounded-2xl ring-1 w-max ring-lama text-lama py-2 px-4 text-xs hover:bg-lama hover:text-white">
            Add to Cart
          </button>
        </Link>
      ))}
      {searchParams?.cat || searchParams?.name ? (
        <Pagination
          currentPage={res.currentPage || 0}
          hasPrv={res.hasPrev()}
          hasNxt={res.hasNext()}
        />
      ) : null}
    </div>
  );
};

export default ProductList;
