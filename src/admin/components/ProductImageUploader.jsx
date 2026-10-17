import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle,
  Star, Check, Loader2, Plus
} from 'lucide-react';
import {
  validateImageFile,
  optimizeImage
} from '../utils/imageOptimizer';

const ProductImageUploader = ({
  images = [],
  onChange,
  productName = '',
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const createdObjectUrls = useRef(new Set());

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      createdObjectUrls.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // ignore
        }
      });
      createdObjectUrls.current.clear();
    };
  }, []);

  // Ensure selected index is always within range
  useEffect(() => {
    if (images.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= images.length) {
      setSelectedIndex(images.length - 1);
    }
  }, [images.length, selectedIndex]);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    setError('');
    setOptimizing(true);

    const newItems = [];

    try {
      for (const rawFile of Array.from(fileList)) {
        // 1. Validation
        const validation = await validateImageFile(rawFile);
        if (!validation.valid) {
          setError(validation.error);
          continue;
        }

        // 2. Client-side optimization (WebP, max 1600x1600)
        const optimized = await optimizeImage(rawFile);
        createdObjectUrls.current.add(optimized.previewUrl);

        newItems.push({
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file: optimized.file,
          previewUrl: optimized.previewUrl,
          public_url: '',
          storage_path: '',
          alt_text: productName || 'Product photo',
          is_primary: images.length === 0 && newItems.length === 0,
          isNew: true,
          optimizedSize: optimized.optimizedSize,
          originalSize: optimized.originalSize
        });
      }

      if (newItems.length > 0) {
        const combined = [...images, ...newItems];
        // Ensure exactly one is marked primary
        const hasPrimary = combined.some((img) => img.is_primary);
        if (!hasPrimary && combined.length > 0) {
          combined[0].is_primary = true;
        }
        onChange(combined);
        setSelectedIndex(images.length); // focus newly added item
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to optimize image. Please try another file.');
    } finally {
      setOptimizing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceCurrent = async (file) => {
    if (!file || disabled || images.length === 0) return;
    setError('');
    setOptimizing(true);

    try {
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      const optimized = await optimizeImage(file);
      createdObjectUrls.current.add(optimized.previewUrl);

      const updated = [...images];
      const current = updated[selectedIndex];

      // Revoke old local preview if it was a blob URL
      if (current.previewUrl && current.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(current.previewUrl);
        createdObjectUrls.current.delete(current.previewUrl);
      }

      updated[selectedIndex] = {
        ...current,
        file: optimized.file,
        previewUrl: optimized.previewUrl,
        isNew: true,
        // Mark old storage path for cleanup upon save
        old_storage_path: current.storage_path || null,
        storage_path: '',
        public_url: ''
      };

      onChange(updated);
    } catch (err) {
      console.error('Image replace error:', err);
      setError('Failed to replace image. Please try again.');
    } finally {
      setOptimizing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleRemoveCurrent = (idx) => {
    if (disabled || images.length === 0) return;
    const target = images[idx];

    if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
      createdObjectUrls.current.delete(target.previewUrl);
    }

    const updated = images.filter((_, i) => i !== idx);

    // If removed item was primary and there are still images, set first as primary
    if (target.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    onChange(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSetPrimary = (idx) => {
    if (disabled || !images[idx]) return;
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === idx
    }));
    onChange(updated);
  };

  const handleAltChange = (val) => {
    if (images.length === 0 || !images[selectedIndex]) return;
    const updated = [...images];
    updated[selectedIndex].alt_text = val;
    onChange(updated);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const activeImage = images[selectedIndex] || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-gray-900">
            Product Images
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            JPG, PNG or WEBP (Max 5MB each). Automatically optimized for high-speed delivery.
          </p>
        </div>
        {images.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </span>
        )}
      </div>

      {/* Main Preview Container */}
      {images.length > 0 && activeImage ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm group">
            {/* Primary Image Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
              {activeImage.is_primary ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Primary Image
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(selectedIndex)}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 hover:bg-white text-gray-800 text-xs font-semibold rounded-full shadow-md backdrop-blur transition-all hover:scale-105"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Make Primary
                </button>
              )}
            </div>

            {/* Preview Image */}
            <div className="aspect-[4/3] w-full max-h-80 flex items-center justify-center bg-gray-100 overflow-hidden relative">
              <img
                src={activeImage.previewUrl || activeImage.public_url}
                alt={activeImage.alt_text || productName || 'Product preview'}
                className="w-full h-full object-contain transition-transform duration-300"
              />

              {optimizing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  <span className="text-xs font-semibold text-gray-700">Optimizing image...</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  disabled={disabled || optimizing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveCurrent(selectedIndex)}
                  disabled={disabled || optimizing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              {activeImage.optimizedSize && (
                <span className="text-[11px] text-gray-400">
                  Optimized: {(activeImage.optimizedSize / 1024).toFixed(0)} KB WebP
                </span>
              )}
            </div>
          </div>

          {/* Accessibility Alt Text Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Image Alt Text (Accessibility & SEO)
            </label>
            <input
              type="text"
              value={activeImage.alt_text || ''}
              onChange={(e) => handleAltChange(e.target.value)}
              placeholder="Descriptive text for this product image..."
              disabled={disabled}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Thumbnails Gallery Strip */}
          <div className="flex items-center gap-3 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative group cursor-pointer flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 scale-105'
                    : 'border-gray-200 hover:border-gray-300 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={img.previewUrl || img.public_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute bottom-1 left-1 bg-emerald-600 text-white p-0.5 rounded-full text-[9px]">
                    <Star className="w-3 h-3 fill-current" />
                  </span>
                )}
              </div>
            ))}

            {/* Add More Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || optimizing}
              className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-emerald-700 transition-all"
              title="Add another photo"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Add Photo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Drop Zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50/60'
          } ${disabled || optimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {optimizing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                {optimizing ? 'Optimizing photo...' : 'Drag image here or Browse Files'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or WEBP (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled || optimizing}
        className="hidden"
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => e.target.files?.[0] && handleReplaceCurrent(e.target.files[0])}
        disabled={disabled || optimizing}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
