import { prisma } from "../../../lib/prisma";
import { requireOwner } from "../../../lib/auth-helpers";
import SettingsForm from "./SettingsForm";

export default async function AdminSettings() {
  await requireOwner();
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const hours: any = map["shop.hours"] || {};
  const delivery: any = map["shop.delivery"] || {};

  return (
    <div className="ad-page">
      <div className="ad-page-head">
        <div className="ad-page-head-text">
          <span className="ad-eyebrow">Configuration</span>
          <h1 className="ad-h1">Settings</h1>
          <p className="ad-h1-sub">Owner-only. Shop hours, delivery windows, integrations.</p>
        </div>
      </div>

      <SettingsForm initialHours={hours} initialDelivery={delivery} />
    </div>
  );
}
