/**
 * Food Empire Product Image Optimizer & Validator
 * Provides client-side validation, dimension normalization, and WebP compression.
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
export const MAX_DIMENSION = 1600; // Max 1600x1600 preserving aspect ratio
export const DEFAULT_QUALITY = 0.85;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Verify magic bytes header to prevent spoofed file extensions
 */
export const validateImageSignature = async (file) => {
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return true;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0D &&
      bytes[5] === 0x0A &&
      bytes[6] === 0x1A &&
      bytes[7] === 0x0A
    ) {
      return true;
    }

    // WEBP: RIFF .... WEBP
    // bytes 0-3: 'RIFF' (0x52 0x49 0x46 0x46), bytes 8-11: 'WEBP' (0x57 0x45 0x42 0x50)
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Signature check failed, falling back to MIME check:', err);
    return false;
  }
};

/**
 * Validate a candidate file before processing
 */
export const validateImageFile = async (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // 1. MIME type validation
  const lowerType = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(lowerType)) {
    return {
      valid: false,
      error: 'Please upload a JPG, PNG or WEBP image.'
    };
  }

  // 2. Size validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image must be smaller than 5 MB.'
    };
  }

  // 3. Magic bytes signature validation
  const signatureValid = await validateImageSignature(file);
  if (!signatureValid) {
    return {
      valid: false,
      error: 'File content does not match a valid JPG, PNG, or WEBP image.'
    };
  }

  return { valid: true, error: null };
};

/**
 * Load image file into an HTMLImageElement
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for processing.'));
    img.src = src;
  });
};

/**
 * Calculate scaled dimensions fitting within MAX_DIMENSION while keeping aspect ratio
 */
export const calculateFitDimensions = (width, height, maxDim = MAX_DIMENSION) => {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }

  if (width > height) {
    const scaledHeight = Math.round((height * maxDim) / width);
    return { width: maxDim, height: scaledHeight };
  } else {
    const scaledWidth = Math.round((width * maxDim) / height);
    return { width: scaledWidth, height: maxDim };
  }
};

/**
 * Optimize an image file client-side:
 * - Resizes if dimensions exceed 1600x1600
 * - Converts to WebP (with fallback to JPEG)
 * - Returns optimized File + metadata
 */
export const optimizeImage = async (file, options = {}) => {
  const quality = options.quality || DEFAULT_QUALITY;
  const maxDim = options.maxDimension || MAX_DIMENSION;

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);
    const { width: origWidth, height: origHeight } = img;
    const { width: targetWidth, height: targetHeight } = calculateFitDimensions(
      origWidth,
      origHeight,
      maxDim
    );

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available.');
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw image onto canvas
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Export to WebP blob
    let blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    let formatExt = 'webp';
    let mimeType = 'image/webp';

    // If WebP is not supported or export failed, fallback to JPEG
    if (!blob || blob.size === 0) {
      blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
      });
      formatExt = 'jpg';
      mimeType = 'image/jpeg';
    }

    if (!blob) {
      throw new Error('Failed to compress image.');
    }

    // Clean original filename and append target extension
    const baseName = (file.name || 'image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFilename = `${baseName}.${formatExt}`;

    const optimizedFile = new File([blob], finalFilename, {
      type: mimeType,
      lastModified: Date.now()
    });

    const previewUrl = URL.createObjectURL(optimizedFile);

    return {
      file: optimizedFile,
      previewUrl,
      width: targetWidth,
      height: targetHeight,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      format: formatExt
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
