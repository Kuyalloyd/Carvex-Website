import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, X } from 'lucide-react';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_PRODUCT_IMAGE, resolveProductImage } from '../../utils/productImage';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

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

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const buildProductStatus = (stock) => {
    if (stock <= 0) {
        return {
            label: 'Out of stock',
            tone: 'is-out',
        };
    }

    if (stock < 5) {
        return {
            label: `Only ${stock} left`,
            tone: 'is-low',
        };
    }

    return {
        label: `${stock} in stock`,
        tone: 'is-ready',
    };
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
    const [sortBy, setSortBy] = useState('name-asc');
    const [stockOnly, setStockOnly] = useState(false);

    useEffect(() => {
        setSearch(new URLSearchParams(location.search).get('search') || '');
    }, [location.search]);

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

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            if (category && item.category !== category) return false;
            if (brand && item.brand !== brand) return false;
            if (stockOnly && item.stock <= 0) return false;

            if (search.trim()) {
                const needle = search.toLowerCase().trim();
                return (
                    String(item.name || '').toLowerCase().includes(needle)
                    || String(item.sku || '').toLowerCase().includes(needle)
                    || String(item.brand || '').toLowerCase().includes(needle)
                    || String(item.category || '').toLowerCase().includes(needle)
                );
            }

            return true;
        });
    }, [products, category, brand, stockOnly, search]);

    const visibleProducts = useMemo(() => {
        const items = [...filteredProducts];

        switch (sortBy) {
        case 'price-asc':
            items.sort((left, right) => left.price - right.price);
            break;
        case 'price-desc':
            items.sort((left, right) => right.price - left.price);
            break;
        case 'stock-desc':
            items.sort((left, right) => right.stock - left.stock || left.name.localeCompare(right.name));
            break;
        case 'brand-asc':
            items.sort((left, right) => left.brand.localeCompare(right.brand) || left.name.localeCompare(right.name));
            break;
        case 'name-asc':
        default:
            items.sort((left, right) => left.name.localeCompare(right.name));
            break;
        }

        return items;
    }, [filteredProducts, sortBy]);

    const activeFilters = useMemo(() => {
        const filters = [];

        if (search.trim()) {
            filters.push(`Search: ${search.trim()}`);
        }

        if (category) {
            filters.push(`Category: ${category}`);
        }

        if (brand) {
            filters.push(`Brand: ${brand}`);
        }

        if (stockOnly) {
            filters.push('In stock only');
        }

        return filters;
    }, [search, category, brand, stockOnly]);

    const handleAddToCart = async (product) => {
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
            }, 1400);
        } finally {
            setAddingProductId(null);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setBrand('');
        setSortBy('name-asc');
        setStockOnly(false);

        if (location.search) {
            navigate('/dashboard/products', { replace: true });
        }
    };

    return (
        <section className="dashboard-products-shell">
            <div className="dashboard-products-toolbar">
                <div className="dashboard-products-search">
                    <Search size={18} />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by product name, SKU, category, or brand"
                    />
                </div>

                <div className="dashboard-products-toolbar__controls">
                    <label className="dashboard-products-field">
                        <span>Category</span>
                        <select value={category} onChange={(event) => setCategory(event.target.value)}>
                            <option value="">All categories</option>
                            {categories.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>

                    <label className="dashboard-products-field">
                        <span>Brand</span>
                        <select value={brand} onChange={(event) => setBrand(event.target.value)}>
                            <option value="">All brands</option>
                            {brands.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>

                    <label className="dashboard-products-field">
                        <span>Sort by</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                            <option value="name-asc">Name A-Z</option>
                            <option value="brand-asc">Brand A-Z</option>
                            <option value="price-asc">Price low to high</option>
                            <option value="price-desc">Price high to low</option>
                            <option value="stock-desc">Most stock</option>
                        </select>
                    </label>

                    <button
                        type="button"
                        className={`dashboard-products-stock-toggle${stockOnly ? ' is-active' : ''}`}
                        onClick={() => setStockOnly((current) => !current)}
                    >
                        <Filter size={16} />
                        {stockOnly ? 'Showing stocked only' : 'In stock only'}
                    </button>

                    <button type="button" className="dashboard-products-clear" onClick={clearFilters}>
                        <X size={16} />
                        Reset
                    </button>
                </div>

                <div className="dashboard-products-toolbar__footer">
                    <div className="dashboard-products-results">
                        <strong>{visibleProducts.length}</strong>
                        <span>
                            of {products.length} catalog items
                        </span>
                    </div>

                    {activeFilters.length > 0 ? (
                        <div className="dashboard-products-active-filters">
                            {activeFilters.map((value) => (
                                <span key={value} className="dashboard-products-filter-chip">{value}</span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            {loading ? (
                <div className="dashboard-products-grid">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={`loading-${index}`} className="dashboard-product-card dashboard-product-card--skeleton">
                            <div className="dashboard-product-card__media" />
                            <div className="dashboard-product-card__body">
                                <span className="dashboard-product-card__skeleton-line dashboard-product-card__skeleton-line--sm" />
                                <span className="dashboard-product-card__skeleton-line" />
                                <span className="dashboard-product-card__skeleton-line dashboard-product-card__skeleton-line--sm" />
                                <span className="dashboard-product-card__skeleton-line" />
                                <span className="dashboard-product-card__skeleton-line dashboard-product-card__skeleton-line--lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : visibleProducts.length === 0 ? (
                <div className="dashboard-products-empty">
                    <h3>No products match this view</h3>
                    <p>Try removing a filter or search term to reopen the full catalog.</p>
                    <button type="button" onClick={clearFilters}>Clear filters</button>
                </div>
            ) : (
                <div className="dashboard-products-grid">
                    {visibleProducts.map((product) => {
                        const productStatus = buildProductStatus(product.stock);
                        const canOpenDetails = !String(product.id).startsWith('temp-');

                        return (
                            <article key={product.id} className="dashboard-product-card">
                                <div className="dashboard-product-card__media">
                                    <div className="dashboard-product-card__badges">
                                        <span
                                            className="dashboard-product-card__badge"
                                            title={product.category}
                                        >
                                            {product.category}
                                        </span>
                                        <span
                                            className={`dashboard-product-card__badge dashboard-product-card__badge--status ${productStatus.tone}`}
                                            title={productStatus.label}
                                        >
                                            {productStatus.label}
                                        </span>
                                    </div>

                                    <div className="dashboard-product-card__image-stage">
                                        <img
                                            src={resolveProductImage(product.images)}
                                            alt={product.name}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="dashboard-product-card__body">
                                    <div className="dashboard-product-card__eyebrow">
                                        <span title={product.brand}>{product.brand}</span>
                                        <span title={product.sku || 'Catalog SKU pending'}>{product.sku || 'Catalog SKU pending'}</span>
                                    </div>

                                    <h3 title={product.name}>{product.name}</h3>

                                    <div className="dashboard-product-card__meta">
                                        <div>
                                            <span>Brand</span>
                                            <strong title={product.brand}>{product.brand}</strong>
                                        </div>
                                        <div>
                                            <span>Category</span>
                                            <strong title={product.category}>{product.category}</strong>
                                        </div>
                                        <div>
                                            <span>Stock</span>
                                            <strong>{product.stock > 0 ? `${product.stock} units` : 'Unavailable'}</strong>
                                        </div>
                                    </div>

                                    <div className="dashboard-product-card__footer">
                                        <div className="dashboard-product-card__price-block">
                                            <span>Unit price</span>
                                            <strong>{formatCurrency(product.price)}</strong>
                                        </div>

                                        <div
                                            className={`dashboard-product-card__availability ${productStatus.tone}`}
                                            title={productStatus.label}
                                        >
                                            {productStatus.label}
                                        </div>
                                    </div>

                                    <div className="dashboard-product-card__actions">
                                        {canOpenDetails ? (
                                            <Link className="dashboard-product-card__link" to={`/dashboard/products/${product.id}`}>
                                                View details
                                            </Link>
                                        ) : (
                                            <span className="dashboard-product-card__link dashboard-product-card__link--muted">
                                                Catalog item
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            disabled={product.stock <= 0 || addingProductId === product.id}
                                            className={`dashboard-product-card__cta${addedProductId === product.id ? ' is-added' : ''}`}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            <ShoppingCart size={16} />
                                            {addingProductId === product.id
                                                ? 'Adding...'
                                                : addedProductId === product.id
                                                    ? 'Added to cart'
                                                    : 'Add to cart'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
