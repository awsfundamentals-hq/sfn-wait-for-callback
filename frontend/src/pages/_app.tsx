import type { AppProps } from "next/app";
import Link from "next/link";
import "../../app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <nav className="flex items-center justify-center h-12 px-4 border-b gap-4">
        <Link className="text-sm font-medium hover:underline" href="/">
          Submit Article
        </Link>
        <Link className="text-sm font-medium hover:underline" href="/admin">
          Content Moderation
        </Link>
      </nav>
      <div className="px-16 py-8">
        <Component {...pageProps} />
      </div>
    </>
  );
}
