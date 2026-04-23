import DashboardNav from '../components/DashboardNav';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Grid, List, Package, Truck, Shield, Trash2, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { SkeletonProductGrid } from '../components/Skeleton';

const categories = ['All Products', 'Test Kits', 'Medicine', 'Wellness Toys', 'Medical Devices', 'Supplements'];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const [checkoutState, setCheckoutState] = useState('idle'); // idle | creating | paying | verifying | success | error
  const [checkoutError, setCheckoutError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('Name A-Z');
  const [gridView, setGridView] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/products'),
      api.get('/api/cart'),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data);
      setCart(cRes.data);
    }).catch(() => {}).finally(() => {
      setLoadingProducts(false);
      setLoadingCart(false);
    });
  }, []);

  const isInCart = (productId) => cart.some((c) => c.product_id === productId);

  const addToCart = async (productId) => {
    if (isInCart(productId)) return;
    setAddingId(productId);
    try {
      await api.post('/api/cart', { product_id: productId, quantity: 1 });
      const { data } = await api.get('/api/cart');
      setCart(data);
      toast.success('Added to cart');
    } catch (_) {
      toast.error('Could not add to cart. Try again.');
    } finally {
      setAddingId(null);
    }
  };

  const removeFromCart = async (cartItemId) => {
    setRemovingId(cartItemId);
    try {
      await api.delete(`/api/cart/${cartItemId}`);
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
      toast.success('Item removed from cart');
    } catch (_) {
      toast.error('Could not remove item. Try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const cartTotal = cart.reduce((s, c) => s + parseFloat(c.price) * c.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setCheckoutState('creating');
    setShowCart(false);

    try {
      // Step 1: create Razorpay order server-side (price computed from DB)
      const { data: orderData } = await api.post('/api/orders/create-razorpay-order', {
        cart_item_ids: cart.map((c) => c.id),
      });

      // Step 2: load Razorpay checkout.js
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setCheckoutError('Could not load payment gateway. Check your connection.');
        setCheckoutState('error');
        return;
      }

      setCheckoutState('paying');

      // Step 3: open Razorpay modal
      await new Promise((resolve, reject) => {
        const options = {
          key:         orderData.key_id,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        'HarmoHelp',
          description: 'Health & Wellness Products',
          order_id:    orderData.razorpay_order_id,
          theme:       { color: '#1a1a2e' },
          modal: {
            ondismiss: () => {
              setCheckoutState('idle');
              resolve(); // user closed modal — not an error
            },
          },
          handler: async (response) => {
            // Step 4: verify payment server-side
            setCheckoutState('verifying');
            try {
              const { data: verified } = await api.post('/api/orders/verify-payment', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                cart_item_ids:       cart.map((c) => c.id),
              });
              setCompletedOrder(verified.order);
              setCart([]);
              setCheckoutState('success');
              toast.success('Order confirmed! Thank you for your purchase.');
              resolve();
            } catch (err) {
              setCheckoutError(err?.response?.data?.error || 'Payment verification failed. Contact support.');
              setCheckoutState('error');
              reject(err);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setCheckoutError(response?.error?.description || 'Payment failed. Please try again.');
          setCheckoutState('error');
          reject(new Error('payment.failed'));
        });
        rzp.open();
      });
    } catch (err) {
      if (checkoutState !== 'error') {
        setCheckoutError(err?.response?.data?.error || 'Checkout failed. Please try again.');
        setCheckoutState('error');
      }
    }
  };

  const filtered = products
    .filter((p) =>
      (activeCategory === 'All Products' || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortBy === 'Name A-Z' ? a.name.localeCompare(b.name) : parseFloat(b.price) - parseFloat(a.price));

  const isCheckoutBusy = checkoutState === 'creating' || checkoutState === 'verifying';

  return (
    <div className="min-h-screen bg-white">
      {/* Order success overlay */}
      {checkoutState === 'success' && completedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <CheckCircle size={48} className="text-green-500 mb-3" />
              <h2 className="text-2xl font-black text-navy">Order Confirmed!</h2>
              <p className="text-gray-400 text-sm mt-1">Your payment was successful</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-medium">Order Summary</p>
              {completedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-navy">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold text-navy">
                <span>Total Paid</span>
                <span>₹{parseFloat(completedOrder.total).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              Payment ID: <span className="font-mono">{completedOrder.razorpay_payment_id}</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutState('idle')}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </button>
              <Link
                to="/dashboard"
                className="flex-1 bg-navy text-white py-2.5 rounded-xl text-sm font-medium text-center hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
          🏠 Save Cart & Return to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy">Health & Wellness Shop</h1>
            <p className="text-gray-400 text-sm">Discover quality products for your hormonal health journey</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCart((v) => !v)}
              className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 relative"
            >
              <ShoppingCart size={16} />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-navy text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>
              )}
            </button>

            {showCart && (
              <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-navy">Your Cart</h3>
                  <button onClick={() => setShowCart(false)} className="text-gray-300 hover:text-gray-500">
                    <X size={16} />
                  </button>
                </div>
                {loadingCart ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Your cart is empty.</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                        <div className="flex-1 mr-2">
                          <p className="text-sm font-medium text-navy line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">₹{parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={removingId === item.id}
                          className="text-gray-300 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-navy mt-2 mb-4">
                      <span>Total</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>

                    {checkoutState === 'error' && (
                      <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{checkoutError}</p>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={isCheckoutBusy}
                      className="w-full bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCheckoutBusy ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {checkoutState === 'creating' ? 'Preparing order…' : 'Verifying payment…'}
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} /> Proceed to Pay
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-xs border border-gray-200 rounded-xl px-3 py-2">
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
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeCategory === c ? 'border-navy text-navy bg-[#FFF3CC]' : 'border-transparent text-gray-500 hover:text-navy'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loadingProducts ? (
          <SkeletonProductGrid count={8} />
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">Showing {filtered.length} of {products.length} products</p>

            <div className={`grid gap-4 mb-10 ${gridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filtered.map((product) => (
                <div key={product.id} className={`border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition ${!gridView ? 'flex gap-4' : ''}`}>
                  <img src={product.image_url} alt={product.name} loading="lazy" width={gridView ? 400 : 160} height={gridView ? 176 : 128} className={`object-cover ${gridView ? 'w-full h-44' : 'w-40 h-32 flex-shrink-0'}`} />
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-navy text-sm mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex text-yellow-400 text-xs mb-2">{'★★★★★'}<span className="text-gray-300 ml-1">(0)</span></div>
                    <p className="font-black text-lg text-navy mb-3">₹{parseFloat(product.price).toFixed(2)}</p>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={addingId === product.id}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
                        isInCart(product.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#FFF3CC] text-navy border border-[#E8D88A] hover:bg-[#FFE88A]'
                      }`}
                    >
                      <ShoppingCart size={14} />
                      {addingId === product.id ? 'Adding…' : isInCart(product.id) ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-t border-gray-200">
          {[
            { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'Free shipping on orders over ₹50' },
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
