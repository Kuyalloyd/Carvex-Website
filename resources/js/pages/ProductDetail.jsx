import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ShoppingCart, Heart, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { FALLBACK_PRODUCT_IMAGE, resolveProductImage } from '../utils/productImage';

export default function ProductDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setError(null);
                setImageError(false);
                const res = await productService.getById(id);
                if (res.data?.data) {
                    setProduct(res.data.data);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError(err.response?.data?.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            const redirect = `${location.pathname}${location.search}`;
            navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
            return;
        }

        try {
            await addItem(product.id, quantity, {
                name: product.name,
                price: product.price,
                images: product.images,
                brand: product.brand,
            });
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (err) {
            console.error('Failed to add to cart:', err);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
                <div className="text-center rounded-2xl border border-slate-200 bg-white/90 px-8 py-7 shadow-lg shadow-slate-900/5 backdrop-blur">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mb-4">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading product details...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xl shadow-slate-900/5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                            <AlertCircle size={28} className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
                        <p className="text-slate-600 mb-6">{error || 'The product you are looking for does not exist or has been removed.'}</p>
                        <Link 
                            to="/products" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition font-semibold"
                        >
                            <ChevronLeft size={18} />
                            Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/products" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition font-semibold text-sm">
                        <ChevronLeft size={16} />
                        Back to Products
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
                    {/* Product Images */}
                    <div>
                        <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                            <div className="h-[380px] sm:h-[460px] bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                                {!imageError ? (
                                    <img
                                        src={resolveProductImage(product.images)}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 sm:p-5"
                                        onError={(event) => {
                                            if (event.currentTarget.dataset.fallbackApplied === '1') {
                                                setImageError(true);
                                                return;
                                            }

                                            event.currentTarget.dataset.fallbackApplied = '1';
                                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                        }}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-slate-400 mt-2">No image available</p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Images Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="p-4 border-t border-slate-200 grid grid-cols-4 gap-2 bg-white">
                                    {product.images.slice(0, 4).map((img, idx) => (
                                        <div key={idx} className="aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                            <img
                                                src={resolveProductImage(img)}
                                                alt={`Product ${idx + 1}`}
                                                className="w-full h-full object-contain p-2"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Brand */ }
                        {product.brand && (
                            <p className="text-sm font-bold text-orange-600 uppercase tracking-[0.18em] mb-2">
                                {product.brand}
                            </p>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-2">
                            {product.name}
                        </h1>

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-sm text-slate-500 mb-4">SKU: {product.sku}</p>
                        )}

                        {/* Price */}
                        <div className="mb-6 pb-6 border-b border-slate-200">
                            <p className="text-4xl font-black text-slate-900">
                                ₱{(product.price || 0).toFixed(2)}
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-6">
                            {product.stock > 0 ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                                    <CheckCircle size={18} className="text-green-600" />
                                    <span className="text-emerald-700 font-semibold">In Stock ({product.stock} available)</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                                    <AlertCircle size={18} className="text-red-600" />
                                    <span className="text-red-700 font-semibold">Out of Stock</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-[0.14em] mb-2">Description</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.category && (
                            <div className="mb-6 pb-6 border-b border-slate-200">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-[0.14em] mb-3">Specifications</h3>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Category:</span>
                                        <span className="font-semibold text-slate-900 text-right">
                                            {typeof product.category === 'string' ? product.category : product.category?.name || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Section */}
                        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
                            {/* Quantity Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={product.stock === 0}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                        disabled={product.stock === 0}
                                        className="w-16 h-10 text-center border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={quantity >= product.stock || product.stock === 0}
                                        className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-xl hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-slate-500 ml-2">
                                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={`w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 shadow-lg ${
                                    isAdded
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                                        : product.stock === 0
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-500/25'
                                }`}
                            >
                                {isAdded ? (
                                    <>
                                        <CheckCircle size={20} />
                                        Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        Add to Cart
                                    </>
                                )}
                            </button>

                            {/* Wishlist & Share */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2 text-slate-700 font-semibold">
                                    <Heart size={18} />
                                    Save
                                </button>
                                <button className="py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2 text-slate-700 font-semibold">
                                    <Share2 size={18} />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-8 border-t border-slate-200 text-sm text-slate-600">
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-600">✓</span> Free shipping on orders over ₱1000
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-600">✓</span> 30-day money-back guarantee
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-orange-600">✓</span> Authentic products guaranteed
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
