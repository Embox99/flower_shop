import ProductCard from "./ProductCard";
import { listProducts } from "../lib/product-api";

type Props = {
  category?: string; // category slug
  limit?: number;
  searchParams?: any;
};

const PRODUCT_PER_PAGE = 8;

const ProductList = async ({ category, limit, searchParams: rawSp }: Props) => {
  const sp = await rawSp;
  const params: Record<string, any> = {
    category, limit: limit || PRODUCT_PER_PAGE,
    page: sp?.page,
    sort: sp?.sort,
    q: sp?.name,
    min: sp?.min ? parseInt(sp.min) * 100 : undefined,
    max: sp?.max ? parseInt(sp.max) * 100 : undefined,
  };
  const data = await listProducts(params);
  if (!data.items.length) {
    return <div className="fs-list-empty"><p>Nothing matches these filters today.</p></div>;
  }
  return (
    <div className="fs-list-grid">
      {data.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
};

export default ProductList;
