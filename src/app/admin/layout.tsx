/** Server-only admin layout — checks the session, redirects non-staff. */
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import "./admin.css";

export const metadata = {
  title: "Flower Shop · Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "OWNER")) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="ad-frame">
      <AdminSidebar user={session.user} />
      <div className="ad-main">
        <AdminTopbar user={session.user} />
        {children}
      </div>
    </div>
  );
}
