import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ProductImageUploader from '../components/ProductImageUploader';
import {
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
  deleteMultipleProductImages
} from '../services/productService';
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Copy
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'beef', label: 'Beef' },
  { value: 'fries', label: 'French Fries' },
  { value: 'lamb', label: 'Lamb' },
  { value: 'cheese', label: 'Cheese' },
  { value: 'butter_margarine', label: 'Butter & Margarine' },
  { value: 'others', label: 'Others' }
];

const AdminProductForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditing = Boolean(id);
  const isDuplicating = Boolean(location.state?.duplicateData);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'beef',
    country: '',
    description: '',
    badge: 'Premium',
    rating: '4.8',
    suppliers: '3',
    is_published: true
  });

  // Images State (handles multiple gallery photos & primary selection)
  const [images, setImages] = useState([]);

  // UI state
  const [loading, setLoading] = useState(isEditing && !isDuplicating);
  const [saving, setSaving] = useState(false);
  const [saveStepText, setSaveStepText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pre-fill if duplicating
  useEffect(() => {
    if (isDuplicating && location.state?.duplicateData) {
      const dup = location.state.duplicateData;
      setFormData({
        name: dup.name || '',
        category: dup.category || 'beef',
        country: dup.country || '',
        description: dup.description || '',
        badge: dup.badge || '',
        rating: dup.rating || '4.8',
        suppliers: dup.suppliers || '1',
        is_published: false // Draft by default for review
      });
      setImages([]); // Fresh image required for duplicated product
    }
  }, [isDuplicating, location.state]);

  // Load existing product if editing
  useEffect(() => {
    if (!isEditing || isDuplicating) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const { data, error: fetchErr } = await getProductById(id);

        if (fetchErr || !data) {
          throw new Error('Product not found or failed to load.');
        }

        setFormData({
          name: data.name || '',
          category: data.category || 'beef',
          country: data.country || '',
          description: data.description || '',
          badge: data.badge || '',
          rating: data.rating?.toString() || '4.8',
          suppliers: data.suppliers?.toString() || '1',
          is_published: data.is_published ?? true
        });

        // Initialize images from gallery or primary
        if (Array.isArray(data.gallery_images) && data.gallery_images.length > 0) {
          setImages(
            data.gallery_images.map((g, idx) => ({
              id: g.id || `img_${idx}`,
              public_url: g.public_url || '',
              previewUrl: g.public_url || '',
              storage_path: g.storage_path || '',
              alt_text: g.alt_text || data.name || '',
              is_primary: g.is_primary || (idx === 0),
              isNew: false
            }))
          );
        } else if (data.image) {
          setImages([
            {
              id: 'primary',
              public_url: data.image,
              previewUrl: data.image,
              storage_path: data.image_path || '',
              alt_text: data.name || '',
              is_primary: true,
              isNew: false
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching product for edit:', err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditing, isDuplicating]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      return 'Product Name is required.';
    }
    if (formData.name.trim().length < 2) {
      return 'Product Name must be at least 2 characters.';
    }
    if (!formData.category) {
      return 'Category is required.';
    }
    const numRating = parseFloat(formData.rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 5.0) {
      return 'Rating must be a number between 0.0 and 5.0.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent double submission

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Keep track of newly uploaded paths to allow rollback if database insert fails
    const newlyUploadedPaths = [];
    const oldPathsToDelete = [];

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Pre-determine a stable product ID for storage directory
      const targetProductId = isEditing ? id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);

      // 1. Upload new image files to Supabase Storage
      const processedImages = [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];

        if (item.old_storage_path) {
          oldPathsToDelete.push(item.old_storage_path);
        }

        if (item.isNew && item.file) {
          setSaveStepText(`Uploading photo ${i + 1} of ${images.length}...`);
          const uploadRes = await uploadProductImage(item.file, targetProductId);
          newlyUploadedPaths.push(uploadRes.imagePath);

          processedImages.push({
            storage_path: uploadRes.imagePath,
            public_url: uploadRes.publicUrl,
            alt_text: (item.alt_text || formData.name).trim(),
            is_primary: item.is_primary || (i === 0),
            sort_order: i
          });
        } else {
          processedImages.push({
            storage_path: item.storage_path || '',
            public_url: item.public_url || item.previewUrl || '',
            alt_text: (item.alt_text || formData.name).trim(),
            is_primary: item.is_primary || (i === 0),
            sort_order: i
          });
        }
      }

      // Identify primary image
      const primaryImage = processedImages.find((img) => img.is_primary) || processedImages[0] || null;

      const productPayload = {
        name: formData.name.trim(),
        category: formData.category,
        country: formData.country.trim(),
        description: formData.description.trim(),
        badge: formData.badge.trim(),
        rating: parseFloat(formData.rating) || 4.8,
        suppliers: parseInt(formData.suppliers, 10) || 1,
        is_published: formData.is_published,
        image: primaryImage ? primaryImage.public_url : '',
        image_path: primaryImage ? primaryImage.storage_path : null,
        features: formData.country.trim()
          ? [`${formData.country.trim()} origin`]
          : []
      };

      if (!isEditing && targetProductId) {
        productPayload.id = targetProductId;
      }

      setSaveStepText('Saving product details to database...');

      // 2. Perform Database Operation
      if (isEditing) {
        const { error: updateErr } = await updateProduct(id, productPayload, processedImages);
        if (updateErr) throw updateErr;
        setSuccess('Changes saved successfully.');
      } else {
        const { error: createErr } = await createProduct(productPayload, processedImages);
        if (createErr) throw createErr;
        setSuccess('Product added successfully.');
      }

      // 3. Clean up replaced storage files after database confirms success
      if (oldPathsToDelete.length > 0) {
        await deleteMultipleProductImages(oldPathsToDelete);
      }

      // 4. Redirect after short confirmation delay
      setTimeout(() => {
        navigate('/admin');
      }, 1200);

    } catch (err) {
      console.error('Failed to save product:', err);

      // Rollback newly uploaded storage objects so no orphan files remain
      if (newlyUploadedPaths.length > 0) {
        console.warn('Rolling back uploaded storage files after failure:', newlyUploadedPaths);
        await deleteMultipleProductImages(newlyUploadedPaths);
      }

      setError('Unable to save product. Please check your connection and try again.');
    } finally {
      setSaving(false);
      setSaveStepText('');
    }
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Product' : isDuplicating ? 'Duplicate Product' : 'Add New Product'}
      actionButton={
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Loading product information...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">

            {/* Duplication Notice Banner */}
            {isDuplicating && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <Copy className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Duplicating Product</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Product details have been copied. Please adjust the title, upload a photo, and save when ready.
                  </p>
                </div>
              </div>
            )}

            {/* Error & Success Banners */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Notice</h4>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            {/* Main Form Fields Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
              
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                Product Details
              </h2>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Crinkle Cut Hungritos, Striploin Hokubee"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              {/* Category & Origin Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Country / Origin
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. Australia, Canada, USA, India, China"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used on product cards and in the Country filter dropdown.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe culinary taste, cut characteristics, texture, and preparation recommendations..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
                />
              </div>

              {/* Badge, Rating, Suppliers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Brand / Supplier Badge
                  </label>
                  <input
                    type="text"
                    name="badge"
                    placeholder="e.g. Premium, Hokubee, Acrispy"
                    value={formData.badge}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Rating (0.0 – 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5.0"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Suppliers Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    name="suppliers"
                    value={formData.suppliers}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Product Photography & Image Management Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <ProductImageUploader
                images={images}
                onChange={setImages}
                productName={formData.name}
                disabled={saving}
              />
            </div>

            {/* Visibility / Status Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Publish to Website
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    When active, this product will immediately appear on the public Food Empire catalog.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                to="/admin"
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{saveStepText || 'Saving Product...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Save Product'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
