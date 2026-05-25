import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import StatusPill from "../../../components/admin/StatusPill";
import ClickableRow from "../../../components/admin/ClickableRow";

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      _count: { select: { variants: true, orderItems: true } },
      variants: { select: { stockQty: true } },
    },
  });

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">Catalog</span>
          <h1 className="ad-h1">Products</h1>
          <p className="ad-h1-sub">
            {products.filter((p) => p.status === "ACTIVE").length} live ·{" "}
            {products.filter((p) => p.status === "DRAFT").length} draft ·{" "}
            {products.filter((p) => p.status === "ARCHIVED").length} archived
          </p>
        </div>
        <div className="ad-actions">
          <Link href="/admin/products/new" className="ad-btn ad-btn--dark">
            + New product
          </Link>
        </div>
      </div>

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "right" }}>Stock</th>
              <th style={{ textAlign: "right" }}>Sales</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => {
              const stock = p.variants.reduce(
                (s: number, v: any) => s + v.stockQty,
                0,
              );
              const palette = (p.palette as string[]) || [];
              return (
                <ClickableRow key={p.id} href={`/admin/products/${p.slug}`}>
                  <td>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 46,
                          borderRadius: 6,
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${palette[0] || "#eee"}55, ${palette[2] || "#ccc"}33)`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-serif), serif",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="ad-table-id">{p.sku}</span>
                  </td>
                  <td>{p.category?.name || "—"}</td>
                  <td className="ad-table-money">{fmt(p.basePrice)}</td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--font-mono), monospace",
                      color: stock === 0 ? "var(--ad-warn)" : "inherit",
                    }}
                  >
                    {stock}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {p._count.orderItems}
                  </td>
                  <td>
                    <StatusPill
                      status={
                        p.status === "ACTIVE"
                          ? stock === 0
                            ? "draft"
                            : stock <= 6
                              ? "new"
                              : "ready"
                          : p.status
                      }
                    />
                  </td>
                </ClickableRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
