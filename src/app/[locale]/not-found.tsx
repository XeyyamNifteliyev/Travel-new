import Link from 'next/link';
import { MapPinX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <MapPinX className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3">404</h2>
        <p className="text-txt-sec mb-8">
          Axtardığınız səhifə tapılmadı. Zəhmət olmasa ana səhifəyə qayıdın.
        </p>
        <Link
          href="/az"
          className="px-6 py-3 bg-primary/20 text-primary rounded-lg font-semibold hover:bg-primary/30 transition-colors"
        >
          Ana səhifə
        </Link>
      </div>
    </main>
  );
}
