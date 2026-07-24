import { prisma } from "../../../lib/prisma";
import DeliveriesBoard, { type BoardOrder } from "./DeliveriesBoard";

export default async function AdminDeliveries() {
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfToday } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const board: BoardOrder[] = orders.map((o) => ({
    id: o.id,
    code: o.code,
    status: o.status as BoardOrder["status"],
    deliveryWindow: o.deliveryWindow,
    recipientName: o.recipientName || o.user?.name || null,
    city: o.city,
    total: o.total,
  }));

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
          <h1 className="ad-h1">Today on the bench</h1>
          <p className="ad-h1-sub">Each card is a real order — drag it between columns or click to open it.</p>
        </div>
      </div>

      <DeliveriesBoard orders={board} />
    </div>
  );
}
