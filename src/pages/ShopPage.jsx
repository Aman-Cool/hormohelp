import DashboardNav from '../components/DashboardNav';
import { useState } from 'react';
import { ShoppingCart, Search, Grid, List, Package, Truck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'Adrenal Support Complex', desc: 'Formulated with adaptogenic herbs like Ashwagandha, Rhodiola, and Holy Basil to help...', price: 34.50, category: 'Supplements', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
  { id: 2, name: 'Aromatherapy Essential Oil Diffuser', desc: 'An elegant ultrasonic essential oil diffuser to create a calming atmosphere. Pair with hormone...', price: 49.99, category: 'Wellness Toys', img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80' },
  { id: 3, name: 'Complete Hormone Balance Test Kit', desc: 'A comprehensive at-home test kit to measure key hormone levels (estrogen, progesterone,...', price: 189.99, category: 'Test Kits', img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80' },
  { id: 4, name: 'Fertility Tracking Basal Thermometer', desc: 'High-precision basal body temperature (BBT) thermometer for accurate ovulation tracking....', price: 45.00, category: 'Medical Devices', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
  { id: 5, name: 'Gut Health & Hormone Balance Probiotic', desc: 'A targeted probiotic blend with strains known to support gut microbiome health, which plays a...', price: 36.00, category: 'Supplements', img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&q=80' },
  { id: 6, name: 'Hormone-Friendly Recipe E-book', desc: 'A digital cookbook featuring over 50 delicious and easy-to-prepare recipes designed to suppo...', price: 19.99, category: 'Medicine', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
  { id: 7, name: 'Liver Detox & Hormone Cleanse', desc: "Supports the liver's natural detoxification processes, crucial for metabolizing and...", price: 29.99, category: 'Supplements', img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80' },
  { id: 8, name: 'Menopause Relief Herbal Blend', desc: 'A natural herbal blend featuring Black Cohosh, Dong Quai, and Red Clover to help alleviate...', price: 22.75, category: 'Supplements', img: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80' },
  { id: 9, name: 'PCOS Support Supplement Bundle', desc: 'A curated bundle including Myo-Inositol, Berberine, and a specialized multivitamin to...', price: 79.00, category: 'Supplements', img: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80' },
  { id: 10, name: 'Sleep & Cortisol Regulation Aid', desc: 'A non-habit forming formula with Magnesium, L-Theanine, and Lemon Balm to promote restful...', price: 31.25, category: 'Supplements', img: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&q=80' },
  { id: 11, name: 'Thyroid Health Optimizer', desc: 'Contains iodine, selenium, zinc, and L-tyrosine to support healthy thyroid function, metabolism, a...', price: 39.95, category: 'Supplements', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80' },
  { id: 12, name: "Women's Daily Hormone Multivitamin", desc: 'Specifically designed for women, this multivitamin supports hormonal balance, energy...', price: 28.99, category: 'Supplements', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80' },
];

const categories = ['All Products', 'Test Kits', 'Medicine', 'Wellness Toys', 'Medical Devices'];

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('Name A-Z');
  const [gridView, setGridView] = useState(true);
  const [cart, setCart] = useState([]);

  const addToCart = (id) => setCart((prev) => prev.includes(id) ? prev : [...prev, id]);

  const filtered = products
    .filter((p) =>
      (activeCategory === 'All Products' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortBy === 'Name A-Z' ? a.name.localeCompare(b.name) : b.price - a.price);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          🏠 Save Cart & Return to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy">Health & Wellness Shop</h1>
            <p className="text-gray-400 text-sm">Discover quality products for your hormonal health journey</p>
          </div>
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 relative">
            <ShoppingCart size={16} />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-navy text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-xs border border-gray-200 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="text-sm outline-none flex-1"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
          >
            <option>Name A-Z</option>
            <option>Price High-Low</option>
          </select>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setGridView(true)} className={`px-3 py-2 ${gridView ? 'bg-gray-100' : ''}`}><Grid size={16} /></button>
            <button onClick={() => setGridView(false)} className={`px-3 py-2 ${!gridView ? 'bg-gray-100' : ''}`}><List size={16} /></button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeCategory === c ? 'border-navy text-navy bg-[#FFF3CC]' : 'border-transparent text-gray-500 hover:text-navy'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-4">Showing {filtered.length} of {products.length} products</p>

        <div className={`grid gap-4 mb-10 ${gridView ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {filtered.map((product) => (
            <div key={product.id} className={`border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition ${!gridView ? 'flex gap-4' : ''}`}>
              <img src={product.img} alt={product.name} className={`object-cover ${gridView ? 'w-full h-44' : 'w-40 h-32 flex-shrink-0'}`} />
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-navy text-sm mb-1">{product.name}</h3>
                <p className="text-xs text-gray-400 mb-2 flex-1 line-clamp-2">{product.desc}</p>
                <div className="flex text-yellow-400 text-xs mb-2">{'★★★★★'}<span className="text-gray-300 ml-1">(0)</span></div>
                <p className="font-black text-lg text-navy mb-3">${product.price.toFixed(2)}</p>
                <button
                  onClick={() => addToCart(product.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                    cart.includes(product.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#FFF3CC] text-navy border border-[#E8D88A] hover:bg-[#FFE88A]'
                  }`}
                >
                  <ShoppingCart size={14} />
                  {cart.includes(product.id) ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="grid grid-cols-3 gap-6 py-8 border-t border-gray-200">
          {[
            { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'Free shipping on orders over $50' },
            { icon: <Shield size={24} />, title: 'Secure Checkout', desc: 'Your payment information is protected' },
            { icon: <Package size={24} />, title: 'Quality Products', desc: 'Carefully curated health and wellness products' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">{f.icon}</div>
              <p className="font-semibold text-navy">{f.title}</p>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
