import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Star } from 'lucide-react';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_PRODUCT_IMAGE, resolveProductImage } from '../../utils/productImage';

const parsePrice = (value) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const parseStock = (value) => {
    const numeric = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeProduct = (item, index) => {
    const categoryName = item?.category?.name || item?.category_name || item?.category || 'General';
    return {
        id: item?.id ?? `temp-${index}`,
        name: item?.name || 'Unnamed Product',
        sku: item?.sku || item?.slug || '',
        brand: item?.brand || item?.manufacturer || 'Unknown',
        category: categoryName,
        price: parsePrice(item?.price ?? item?.selling_price ?? item?.amount),
        stock: parseStock(item?.stock ?? item?.quantity ?? item?.inventory),
        images: item?.images || item?.image_url || item?.image || null,
    };
};

const extractProductsArray = (response) => {
    const candidates = [
        response?.data?.data?.data,
        response?.data?.data?.products,
        response?.data?.products,
        response?.data?.data,
        response?.data,
        response,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate;
        }
        if (candidate && typeof candidate === 'object') {
            for (const value of Object.values(candidate)) {
                if (Array.isArray(value)) {
                    return value;
                }
            }
        }
    }

    return [];
};

export default function DashboardProducts() {
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingProductId, setAddingProductId] = useState(null);
    const [addedProductId, setAddedProductId] = useState(null);
    const [search, setSearch] = useState(new URLSearchParams(location.search).get('search') || '');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');

    useEffect(() => {
        let mounted = true;

        const fetchProducts = async () => {
            try {
                const response = await productService.getAll({ per_page: 1000 });
                const extracted = extractProductsArray(response);
                const normalized = extracted.map(normalizeProduct).filter((item) => item.name);
                if (mounted) {
                    setProducts(normalized);
                }
            } catch (error) {
                if (mounted) {
                    setProducts([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => {
            mounted = false;
        };
    }, []);

    const categories = useMemo(() => {
        const values = new Set(products.map((item) => item.category).filter(Boolean));
        return Array.from(values).sort();
    }, [products]);

    const brands = useMemo(() => {
        const values = new Set(products.map((item) => item.brand).filter(Boolean));
        return Array.from(values).sort();
    }, [products]);

    const filtered = useMemo(() => {
        return products.filter((item) => {
            if (category && item.category !== category) return false;
            if (brand && item.brand !== brand) return false;

            if (search.trim()) {
                const needle = search.toLowerCase().trim();
                return (
                    String(item.name || '').toLowerCase().includes(needle)
                    || String(item.sku || '').toLowerCase().includes(needle)
                    || String(item.brand || '').toLowerCase().includes(needle)
                );
            }

            return true;
        });
    }, [products, category, brand, search]);

    const handleAddToCart = async (event, product) => {
        event.preventDefault();

        if (!isAuthenticated) {
            navigate(`/login?redirect=${encodeURIComponent('/dashboard/products')}`);
            return;
        }

        if (!product || product.stock <= 0 || addingProductId === product.id) {
            return;
        }

        try {
            setAddingProductId(product.id);
            await addItem(product.id, 1, {
                name: product.name,
                price: Number(product.price || 0),
                images: product.images,
                brand: product.brand,
            });

            setAddedProductId(product.id);
            window.setTimeout(() => {
                setAddedProductId((current) => (current === product.id ? null : current));
            }, 1200);
        } finally {
            setAddingProductId(null);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setBrand('');
    };

    return (
        <section style={{ border: '1px solid #dbe1ea', borderRadius: 14, background: '#ffffff', padding: '1rem 1rem 1.25rem', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#0f172a', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Products</h2>
                    <p style={{ margin: '0.3rem 0 0', color: '#64748b' }}>Professional catalog view for your customer panel.</p>
                </div>
                <span style={{ borderRadius: 999, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', padding: '8px 12px', fontSize: 13, fontWeight: 800 }}>
                    {filtered.length} items
                </span>
            </div>

            <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', padding: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 180px 180px auto', gap: 10, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff', padding: '0 10px', minHeight: 42 }}>
                        <Search size={16} color="#64748b" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search product name, brand, or SKU"
                            style={{ border: 0, outline: 'none', width: '100%', color: '#0f172a', background: 'transparent' }}
                        />
                    </label>

                    <select value={category} onChange={(event) => setCategory(event.target.value)} style={{ minHeight: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 10px', color: '#0f172a', background: '#fff' }}>
                        <option value="">All categories</option>
                        {categories.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>

                    <select value={brand} onChange={(event) => setBrand(event.target.value)} style={{ minHeight: 42, border: '1px solid #cbd5e1', borderRadius: 10, padding: '0 10px', color: '#0f172a', background: '#fff' }}>
                        <option value="">All brands</option>
                        {brands.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>

                    <button type="button" onClick={clearFilters} style={{ minHeight: 42, border: '1px solid #fed7aa', borderRadius: 10, background: '#fff7ed', color: '#c2410c', fontWeight: 800, padding: '0 12px', cursor: 'pointer' }}>
                        <Filter size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Clear
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ marginTop: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', padding: 20, color: '#64748b', fontWeight: 700 }}>
                    Loading products...
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ marginTop: 16, border: '1px solid #e2e8f0', borderRadius: 12, background: '#f8fafc', padding: 20 }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>No products found</h3>
                    <p style={{ margin: '6px 0 0', color: '#64748b' }}>Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
                    {filtered.map((product) => (
                        <article key={product.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, background: '#ffffff', overflow: 'hidden', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: 160, background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'hidden', flexShrink: 0 }}>
                                <img
                                    src={resolveProductImage(product.images)}
                                    alt={product.name}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                    }}
                                />
                            </div>

                            <div style={{ padding: 12 }}>
                                <p style={{ margin: 0, color: '#64748b', fontSize: 12, fontWeight: 700 }}>{product.brand}</p>
                                <h3 style={{ margin: '3px 0 0', color: '#0f172a', fontSize: 15, fontWeight: 800, minHeight: 38 }}>{product.name}</h3>
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {[...Array(5)].map((_, index) => (
                                        <Star key={index} size={12} color="#fb923c" fill="#fb923c" />
                                    ))}
                                    <span style={{ marginLeft: 6, color: '#64748b', fontSize: 12 }}>(42)</span>
                                </div>

                                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <strong style={{ color: '#0f172a', fontSize: 21 }}>₱{Number(product.price || 0).toFixed(2)}</strong>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: product.stock > 0 ? '#166534' : '#b91c1c' }}>
                                        {product.stock > 0 ? `Stock ${product.stock}` : 'Out of stock'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={product.stock <= 0 || addingProductId === product.id}
                                    onClick={(event) => handleAddToCart(event, product)}
                                    style={{ marginTop: 10, width: '100%', minHeight: 40, border: 0, borderRadius: 10, background: product.stock <= 0 ? '#94a3b8' : addedProductId === product.id ? '#16a34a' : '#f97316', color: '#fff', fontWeight: 800, cursor: product.stock <= 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    {addingProductId === product.id ? 'Adding...' : addedProductId === product.id ? 'Added' : 'Add to Cart'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
