import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import ProductForm from "./ProductForm";

export default async function AdminProductEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // "/admin/products/new" → empty form
  if (id === "new") {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return (
      <div className="ad-page">
        <Link href="/admin/products" className="ad-link-btn" style={{ marginBottom: 14, display: "inline-block" }}>
          ← Back to products
        </Link>
        <ProductForm categories={categories} />
      </div>
    );
  }

  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      images:   { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      stems:    { orderBy: { id: "asc" } },
    },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="ad-page">
      <Link href="/admin/products" className="ad-link-btn" style={{ marginBottom: 14, display: "inline-block" }}>
        ← Back to products
      </Link>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
