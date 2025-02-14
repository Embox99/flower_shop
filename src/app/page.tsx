//"use client";

import Slider from "../components/Slider";
import ProductList from "../components/ProductList";
import CategoryList from "../components/CategoryList";
import Skeleton from "../components/Skeleton";
import { wixClientServer } from "../lib/wixClientServer";
import { Suspense } from "react";

const Home = async () => {
  // const wixClient = useWixClient();

  // useEffect(() => {
  //   const getProducts = async () => {
  //     const res = await wixClient.products.queryProducts().find();
  //     console.log(res);
  //   };
  //   getProducts();
  // }, [wixClient]);

  // const wixClient = await wixClientServer();
  // const res = await wixClient.products.queryProducts().find();
  // console.log(res);
  return (
    <main>
      <div className="">
        <Slider />
        <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          <h1 className="text-2xl">Featured Products</h1>
          <Suspense fallback={<Skeleton />}>
            <ProductList
              categoryId={process.env.FEATURED_PRODUCTS_CATEGORY_ID}
              limit={4}
            />
          </Suspense>
        </div>
        <div className="mt-24">
          <h1 className="text-2xl px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 mb-12">
            Categories
          </h1>
          <Suspense fallback={<Skeleton />}>
            <CategoryList />
          </Suspense>
        </div>
        <div className="mt-24 px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
          <h1 className="text-2xl">New Products</h1>
          <ProductList categoryId={""} />
        </div>
      </div>
    </main>
  );
};

export default Home;
