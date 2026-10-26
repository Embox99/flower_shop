import Link from "next/link";
import BouquetIllustration from "../components/BouquetIllustration";

export default function NotFound() {
  return (
    <main className="fs-success">
      <div className="fs-success-art">
        <BouquetIllustration palette={["#e8c8b9", "#cdd9bd", "#efe2c7", "#b8556e"]} seed={4} className="fs-success-img" />
      </div>
      <span className="fs-section-eyebrow">404</span>
      <h1>Nothing in bloom here.</h1>
      <p>The page you were after has been picked, sold or never planted.</p>
      <div className="fs-success-actions">
        <Link href="/list" className="fs-btn fs-btn--dark">Browse the shop</Link>
        <Link href="/" className="fs-btn fs-btn--ghost">Back home</Link>
      </div>
    </main>
  );
}
