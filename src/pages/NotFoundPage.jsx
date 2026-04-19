import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEF] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-[#FFF3CC] border border-[#E8D88A] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-black text-navy">404</span>
        </div>
        <h1 className="text-2xl font-black text-navy mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          <Heart size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
