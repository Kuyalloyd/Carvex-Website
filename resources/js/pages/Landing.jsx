import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { FALLBACK_PRODUCT_IMAGE, resolveProductImage } from '../utils/productImage';

const formatPeso = (value) => `₱${Number(value || 0).toFixed(2)}`;

export default function Landing() {
    const location = useLocation();
    const fallbackProducts = [
        {
            id: 1,
            name: 'Performance Brake Kit',
            brand: 'AKEBONO',
            price: 149.99,
            image: '/images/carvex.png',
        },
        {
            id: 2,
            name: 'Premium LED Headlight Set',
            brand: 'PHILIPS',
            price: 89.99,
            image: '/images/carvex.png',
        },
        {
            id: 3,
            name: 'Steering Wheel Cover Pro',
            brand: 'SPARCO',
            price: 59.99,
            image: '/images/carvex.png',
        },
        {
            id: 4,
            name: 'Heavy Duty Air Filter',
            brand: 'BOSCH',
            price: 129.99,
            image: '/images/carvex.png',
        },
        {
            id: 5,
            name: 'Performance Brake Pads',
            brand: 'BREMBO',
            price: 179.99,
            image: '/images/carvex.png',
        },
    ];

    const [products, setProducts] = useState(fallbackProducts);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        let isMounted = true;

        const fetchLandingProducts = async () => {
            try {
                setLoading(true);

                const [productResponse, categoryResponse] = await Promise.all([
                    productService.getAll({
                        per_page: 100,
                        sort_by: 'created_at',
                        sort_order: 'desc',
                    }),
                    categoryService.getAll(),
                ]);

                const payload = productResponse?.data?.data;
                const records = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];

                const categoryPayload = categoryResponse?.data?.data;
                const categoryRecords = Array.isArray(categoryPayload?.data)
                    ? categoryPayload.data
                    : Array.isArray(categoryPayload)
                        ? categoryPayload
                        : [];

                const normalized = records
                    .filter((item) => typeof item === 'object' && item !== null)
                    .map((item) => ({
                        id: Number(item.id || 0),
                        name: String(item.name || ''),
                        brand: String(item.brand || ''),
                        price: Number(item.price || 0),
                        stock: Number(item.stock || 0),
                        images: item.images,
                        category_id: item.category_id,
                        category: item.category || null,
                        vehicle_compatibility: item.vehicle_compatibility,
                    }))
                    .filter((item) => item.id > 0 && item.name);

                if (isMounted) {
                    setProducts(normalized);
                    setCategories(
                        categoryRecords
                            .filter((item) => typeof item === 'object' && item !== null)
                            .map((item) => ({
                                id: Number(item.id || 0),
                                name: String(item.name || ''),
                                slug: String(item.slug || ''),
                            }))
                            .filter((item) => item.id > 0 && item.name)
                    );
                    setHasError(false);
                }
            } catch (error) {
                if (isMounted) {
                    setHasError(true);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLandingProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!location.hash) {
            return;
        }

        const hash = location.hash.replace('#', '');
        const timer = window.setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 80);

        return () => window.clearTimeout(timer);
    }, [location.hash]);

    const filteredProducts = useMemo(() => {
        const loweredSearch = search.trim().toLowerCase();
        const selectedCategoryId = String(categoryId || '').trim();

        const nextProducts = products.filter((product) => {
            const categoryValue = String(product.category_id || product.category?.id || '').trim();
            const matchesSearch = !loweredSearch || [product.name, product.brand, product.vehicle_compatibility]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(loweredSearch));
            const matchesCategory = !selectedCategoryId || categoryValue === selectedCategoryId;

            return matchesSearch && matchesCategory;
        });

        const sorted = [...nextProducts].sort((left, right) => {
            if (sortBy === 'price') {
                return sortOrder === 'asc'
                    ? Number(left.price || 0) - Number(right.price || 0)
                    : Number(right.price || 0) - Number(left.price || 0);
            }

            if (sortBy === 'name') {
                return sortOrder === 'asc'
                    ? String(left.name || '').localeCompare(String(right.name || ''))
                    : String(right.name || '').localeCompare(String(left.name || ''));
            }

            return sortOrder === 'asc'
                ? Number(left.id || 0) - Number(right.id || 0)
                : Number(right.id || 0) - Number(left.id || 0);
        });

        return sorted.slice(0, 5);
    }, [categoryId, products, search, sortBy, sortOrder]);

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setSortBy('created_at');
        setSortOrder('desc');
    };

    const displayProducts = useMemo(() => {
        if (filteredProducts.length > 0) {
            return filteredProducts.map((product) => {
                return {
                    id: product.id,
                    name: product.name,
                    brand: product.brand || 'CARVEX',
                    price: formatPeso(product.price),
                    image: resolveProductImage(product.images),
                };
            });
        }

        return [];
    }, [filteredProducts]);

    const hasVisibleProducts = displayProducts.length > 0;
    const isFilterActive = Boolean(search.trim() || categoryId || sortBy !== 'created_at' || sortOrder !== 'desc');

    return (
        <div className="landing-page" id="landing-top">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-content">
                    <span className="landing-kicker">Welcome to CarVex</span>
                    <h1>Premium Auto Parts Marketplace</h1>
                    <p>
                        Shop genuine car parts from trusted brands. Fast shipping, secure checkout, and expert support.
                    </p>
                    <div className="landing-trust-strip" aria-label="Service highlights">
                        <span>✓ Fast Shipping</span>
                        <span>✓ Top Brands</span>
                        <span>✓ Authentic Parts</span>
                    </div>
                    <div className="landing-actions">
                        <Link to="/products" className="btn-primary btn-lg">
                            Shop Now
                        </Link>
                    </div>
                </div>

                <div className="landing-image-wrap">
                    <img
                        src="/images/carvex.png"
                        alt="CarVex automotive parts"
                        className="landing-image"
                    />
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="landing-shop" aria-labelledby="landing-shop-title" id="landing-shop">
                <div className="landing-shop-header" id="landing-deals">
                    <div className="shop-header-content">
                        <span className="landing-shop-kicker">Featured</span>
                        <h2 id="landing-shop-title">Popular Car Parts</h2>
                        <p>Browse our best-selling automotive components and accessories</p>
                    </div>
                </div>

                <div className="landing-categories-strip" id="landing-categories" aria-label="Popular categories">
                    <button
                        type="button"
                        className={`category-chip ${!categoryId ? 'is-active' : ''}`}
                        onClick={() => setCategoryId('')}
                    >
                        All
                    </button>
                    {categories.slice(0, 8).map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`category-chip ${String(categoryId) === String(cat.id) ? 'is-active' : ''}`}
                            onClick={() => setCategoryId(String(cat.id))}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="landing-shop-grid">
                    {hasVisibleProducts ? (
                        displayProducts.map((product) => (
                            <article key={product.id} className="landing-shop-card">
                                <div className="landing-shop-card-image">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                        }}
                                    />
                                </div>
                                <div className="landing-shop-card-body">
                                    <div className="product-brand">{product.brand}</div>
                                    <h3 className="product-title">{product.name}</h3>
                                    <div className="product-rating">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < 4 ? 'star filled' : 'star'}>★</span>
                                            ))}
                                        </div>
                                        <span className="rating-text">4.2 (234)</span>
                                    </div>
                                    <div className="product-meta">
                                        <p className="landing-shop-card-price">{product.price}</p>
                                        <span className="stock-badge in-stock">In Stock</span>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="landing-shop-empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <strong>No products found</strong>
                            <p>{isFilterActive ? 'Try adjusting your search filters' : 'Loading products...'}</p>
                            {isFilterActive && (
                                <button type="button" className="btn btn-primary btn-sm" onClick={resetFilters}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                <div className="landing-shop-footer">
                    <Link to="/products" className="btn-primary btn-lg">
                        Browse All Products
                    </Link>
                </div>
            </section>

            <section className="landing-contact" id="landing-contact" aria-labelledby="landing-contact-title">
                <div className="landing-contact-inner">
                    <span className="landing-contact-kicker">Contact</span>
                    <h2 id="landing-contact-title">Need Help Choosing Parts?</h2>
                    <p>Our support team is ready to help you find the exact fit for your vehicle.</p>

                    <div className="landing-contact-grid">
                        <article className="landing-contact-card">
                            <h3>Email Support</h3>
                            <p>support@carvex.ph</p>
                        </article>
                        <article className="landing-contact-card">
                            <h3>Call Us</h3>
                            <p>+63 9395158432</p>
                        </article>
                        <article className="landing-contact-card">
                            <h3>Visit Store</h3>
                            <p>Agusan del Norte, Butuan City</p>
                        </article>
                    </div>
                </div>
            </section>
        </div>
    );
}
