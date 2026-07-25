import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AddressBook from "./AddressBook";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <main className="px-6 md:px-12 py-16 max-w-3xl mx-auto">
      <Link href="/account" className="fs-link-btn">← Account</Link>
      <h1 className="font-serif text-4xl mt-4 mb-8" style={{ letterSpacing: "-0.02em" }}>Your addresses</h1>
      <AddressBook addresses={addresses} />
    </main>
  );
}
