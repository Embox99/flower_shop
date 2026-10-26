import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import { listProducts } from "../lib/product-api";

type ListSearchParams = Record<string, string | undefined>;

type Props = {
  category?: string; // category slug
  limit?: number;
  searchParams?: ListSearchParams;
};

const PRODUCT_PER_PAGE = 8;

/** Map the /list URL (prices in dollars) onto catalogue query params (cents). */
export function listQuery(category?: string, sp?: ListSearchParams, limit?: number) {
  return {
    category, limit: limit || PRODUCT_PER_PAGE,
    page: sp?.page,
    sort: sp?.sort,
    q: sp?.q,
    color: sp?.color,
    stems: sp?.stems,
    deliver: sp?.deliver,
    min: sp?.min ? parseInt(sp.min) * 100 : undefined,
    max: sp?.max ? parseInt(sp.max) * 100 : undefined,
  };
}

const ProductList = async ({ category, limit, searchParams: sp }: Props) => {
  const data = await listProducts(listQuery(category, sp, limit));
  if (!data.items.length) {
    return <div className="fs-list-empty"><p>Nothing matches these filters today.</p></div>;
  }
  return (
    <div>
      <div className="fs-list-grid">
        {data.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      {(data.hasMore || data.page > 1) && (
        <Pagination page={data.page} hasPrev={data.page > 1} hasNext={data.hasMore} />
      )}
    </div>
  );
};

export default ProductList;
