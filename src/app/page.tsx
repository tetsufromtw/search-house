import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Search House - Phase 2 元件展示
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/components/mapcanvas"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-900">MapCanvas</h2>
            <p className="text-gray-600">Google Map 互動圓圈繪製元件</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
