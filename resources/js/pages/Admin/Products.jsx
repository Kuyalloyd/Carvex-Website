import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { Package, Search, Trash2, Edit, Plus, Eye } from 'lucide-react';
import ProductDetailModal from '../../components/ProductDetailModal';
import ProductEditModal from '../../components/ProductEditModal';
import ProductCreateModal from '../../components/ProductCreateModal';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [creatingProduct, setCreatingProduct] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await adminService.getProducts();
                setProducts(res.data?.data?.data || []);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const refreshProducts = async () => {
        try {
            const res = await adminService.getProducts();
            setProducts(res.data?.data?.data || []);
            // Trigger sidebar count refresh
            window.dispatchEvent(new Event('sidebar-counts-refresh'));
        } catch (err) {
            console.error('Failed to refresh products:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        try {
            const res = await adminService.deleteProduct(id);
            console.log('Delete response:', res);
            setProducts(products.filter(p => p.id !== id));
            alert('Product deleted successfully');
        } catch (err) {
            console.error('Delete error details:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Failed to delete product: ' + err.message);
        }
    };

    // Helper to get category name (handle both string and object)
    const getCategoryName = (cat) => {
        if (!cat) return '';
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat.name) return cat.name;
        return '';
    };

    // Helper to get image URL (handle string, array, and object formats)
    const getImageUrl = (img) => {
        if (!img) return null;
        
        // If it's an array, take the first item
        if (Array.isArray(img) && img.length > 0) {
            img = img[0];
        }
        
        // If it's a string
        if (typeof img === 'string') {
            if (img.trim() === '') return null;
            // If it's already a full URL, return as is
            if (img.startsWith('http')) return img;
            // If it's a path without leading slash, add it
            if (!img.startsWith('/')) img = '/' + img;
            // Return path - server should handle it
            return img;
        }
        
        // If it's an object with url property
        if (typeof img === 'object' && img.url) {
            const url = img.url;
            if (url.startsWith('http')) return url;
            if (!url.startsWith('/')) return '/' + url;
            return url;
        }
        
        // If it's an object with path property
        if (typeof img === 'object' && img.path) {
            const path = img.path;
            if (path.startsWith('http')) return path;
            if (!path.startsWith('/')) return '/' + path;
            return path;
        }
        
        return null;
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const catName = getCategoryName(product.category);
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || catName === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories - handle both string and object formats
    const categories = ['All Categories', ...new Set(products.map(p => getCategoryName(p.category)).filter(Boolean))];

    const getStockBadgeClass = (stock) => {
        if (stock === 0) return 'badge-danger';
        if (stock < 10) return 'badge-warning';
        return 'badge-success';
    };

    const getStockLabel = (stock) => {
        if (stock === 0) return 'out of stock';
        if (stock < 10) return 'low stock';
        return 'in stock';
    };

    // Calculate stats
    const stats = {
        total: products.length,
        inStock: products.filter(p => (p.stock || 0) > 10).length,
        lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
        outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-dashboard-modern">
                    <div className="loading">Loading inventory...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-dashboard-modern">
                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <div className="header-content">
                            <h1>Inventory Management</h1>
                            <p>Manage your car parts inventory</p>
                        </div>
                        <div className="header-action">
                            <button
                                onClick={() => setCreatingProduct(true)}
                                className="btn btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.625rem 1.25rem',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                            >
                                <Plus size={18} />
                                <span>Add New Part</span>
                            </button>
                        </div>
                    </div>

                {/* Status Cards Grid */}
                <div className="admin-stat-grid">
                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--slate">
                            <Package size={20} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Products</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--green">
                            <span>In</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">In Stock</div>
                            <div className="stat-value">{stats.inStock}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--amber">
                            <span>Low</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Low Stock</div>
                            <div className="stat-value">{stats.lowStock}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon stat-icon--red">
                            <span>Out</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Out of Stock</div>
                            <div className="stat-value">{stats.outOfStock}</div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="admin-panel-header" style={{ marginTop: '1rem' }}>
                    <div className="admin-search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="admin-filters">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                    {/* No Images Warning */}
                    {products.length > 0 && products.every(p => !p.images || (Array.isArray(p.images) && p.images.length === 0)) && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            border: '1px solid #fcd34d'
                        }}>
                            Note: Your products don't have images yet. Edit each product and add image URLs in the "Image URLs" field to display product photos in your inventory.
                        </div>
                    )}

                    {/* Table */}
                    {filteredProducts.length === 0 ? (
                        <div className="admin-empty-state">
                            <Package size={48} />
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search or filters</p>
                            <Link to="/admin/products/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                <Plus size={18} />
                                <span>Add Your First Product</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Part Name</th>
                                        <th>SKU</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Supplier</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <div style={{
                                                    width: '3rem',
                                                    height: '3rem',
                                                    borderRadius: '0.5rem',
                                                    background: '#f1f5f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    {getImageUrl(product.images) ? (
                                                        <img src={getImageUrl(product.images)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <Package size={20} color="#94a3b8" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{product.name}</strong>
                                            </td>
                                            <td className="text-mono">
                                                {product.sku || 'N/A'}
                                            </td>
                                            <td className="text-muted">
                                                {getCategoryName(product.category) || 'N/A'}
                                            </td>
                                            <td>
                                                <strong>₱{(Number(product.price) || 0).toFixed(2)}</strong>
                                            </td>
                                            <td>
                                                <span>{product.stock || 0}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStockBadgeClass(product.stock || 0)}`}>
                                                    {getStockLabel(product.stock || 0)}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {product.supplier || 'N/A'}
                                            </td>
                                            <td>
                                                <div className="admin-actions">
                                                    <button
                                                        title="View"
                                                        className="btn-view"
                                                        onClick={() => setSelectedProduct(product)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        title="Edit"
                                                        className="btn-edit"
                                                        onClick={() => setEditingProduct(product)}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <ProductDetailModal 
                        product={selectedProduct} 
                        onClose={() => setSelectedProduct(null)} 
                    />
                )}

                {/* Product Edit Modal */}
                {editingProduct && (
                    <ProductEditModal 
                        product={editingProduct} 
                        onClose={() => setEditingProduct(null)}
                        onSave={refreshProducts}
                    />
                )}

                {/* Product Create Modal */}
                {creatingProduct && (
                    <ProductCreateModal 
                        isOpen={creatingProduct}
                        onClose={() => setCreatingProduct(false)}
                        onSuccess={refreshProducts}
                    />
                )}
            </div>
        </div>
    );
}
