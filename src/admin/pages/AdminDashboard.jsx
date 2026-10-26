import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  getAdminProducts,
  deleteProduct,
  togglePublishProduct,
  prepareDuplicateProduct
} from '../services/productService';
import {
  Search, Plus, Edit2, Trash2, CheckCircle2,
  AlertCircle, Globe, Star, Eye, EyeOff, Loader2, RefreshCw,
  Copy, ChevronLeft, ChevronRight, ImageIcon
} from 'lucide-react';

const CATEGORY_LABELS = {
  all: 'All Categories',
  'Frozen Beef': 'Frozen Beef',
  'Frozen Lamb': 'Frozen Lamb',
  'Imported Poultry': 'Imported Poultry',
  'Frozen Seafood': 'Frozen Seafood',
  'Frozen Potato': 'Frozen Potato',
  'Butter, Cheese & Dairy': 'Butter, Cheese & Dairy',
  'Oils, Sauces & Dry Goods': 'Oils, Sauces & Dry Goods',
  beef: 'Beef (Legacy)',
  fries: 'French Fries (Legacy)',
  lamb: 'Lamb (Legacy)',
  cheese: 'Cheese (Legacy)',
  butter_margarine: 'Butter & Margarine (Legacy)',
  others: 'Others (Legacy)'
};

const ITEMS_PER_PAGE = 15;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [originFilter, setOriginFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, draft

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toggle in-flight tracking
  const [togglingId, setTogglingId] = useState(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchErr } = await getAdminProducts();
      if (fetchErr) {
        throw fetchErr;
      }
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products for CMS:', err);
      setError('Could not load products from the database. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, originFilter, statusFilter]);

  // Derived filter list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.country && item.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.badge && item.badge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(item.features) && item.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      const matchesOrigin =
        originFilter === 'all' || (item.country && item.country.trim().toLowerCase() === originFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && item.is_published) ||
        (statusFilter === 'draft' && !item.is_published);

      return matchesSearch && matchesCategory && matchesOrigin && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, originFilter, statusFilter]);

  // Paginated items
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Unique categories & origins from dataset
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [products]);

  const uniqueOrigins = useMemo(() => {
    const set = new Set(products.map((p) => p.country ? p.country.trim() : '').filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  // Quick Publish Toggle
  const handleTogglePublish = async (product) => {
    try {
      setTogglingId(product.id);
      const { data, error: toggleErr } = await togglePublishProduct(product.id, product.is_published);
      if (toggleErr) throw toggleErr;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_published: data.is_published } : p))
      );
      setFeedback({
        type: 'success',
        message: `"${product.name}" is now ${data.is_published ? 'Published' : 'Draft'}.`
      });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setFeedback({ type: 'error', message: 'Failed to update product status. Please try again.' });
    } finally {
      setTogglingId(null);
    }
  };

  // Duplicate Product Action
  const handleDuplicate = (product) => {
    const dupData = prepareDuplicateProduct(product);
    navigate('/admin/products/new', {
      state: { duplicateData: dupData }
    });
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const { error: delErr } = await deleteProduct(deleteTarget.id, deleteTarget.image_path);
      if (delErr) throw delErr;

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setFeedback({
        type: 'success',
        message: `Product "${deleteTarget.name}" and associated images removed.`
      });
      setDeleteTarget(null);
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      console.error('Failed to delete product:', err);
      setFeedback({ type: 'error', message: 'Failed to delete product. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout
      title="Products Catalog"
      actionButton={
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      }
    >
      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search ~100 products by name, origin, badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories
              .filter((c) => c !== 'all')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
          </select>

          {/* Origin Filter */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">All Origins</option>
            {uniqueOrigins
              .filter((o) => o !== 'all')
              .map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={fetchCatalog}
            title="Refresh List"
            className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading product catalog...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-red-200 p-12 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">Failed to Load Products</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchCatalog}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-xs text-gray-500 mb-4">
            {searchTerm || categoryFilter !== 'all' || originFilter !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search query or active filters.'
              : 'Your product catalog is currently empty.'}
          </p>
          {(searchTerm || categoryFilter !== 'all' || originFilter !== 'all' || statusFilter !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setOriginFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/75">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Product & Photo
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/75 transition-colors group">
                    {/* Image & Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Array.isArray(product.features) && product.features.find((f) => f.startsWith('FE-')) && (
                              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                                {product.features.find((f) => f.startsWith('FE-'))}
                              </span>
                            )}
                            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight">
                              {product.name}
                            </p>
                          </div>
                          {product.badge && (
                            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                    </td>

                    {/* Origin */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{product.country || 'Not specified'}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating || '4.8'}</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={togglingId === product.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          product.is_published
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {togglingId === product.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : product.is_published ? (
                          <Eye className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                        <span>{product.is_published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.isArray(product.features) && product.features.find((f) => f.startsWith('FE-')) && (
                        <span className="font-mono text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shrink-0">
                          {product.features.find((f) => f.startsWith('FE-'))}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {product.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {CATEGORY_LABELS[product.category] || product.category}
                      {product.country ? ` • ${product.country}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={togglingId === product.id}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          product.is_published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_published ? 'Published' : 'Draft'}
                      </button>
                      {product.badge && (
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{' '}
                products
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 text-xs font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          productName={deleteTarget.name}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
