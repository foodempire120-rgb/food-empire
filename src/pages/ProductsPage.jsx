import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  Globe,
  ArrowRight,
  CheckCircle,
  Award,
  X,
  ChevronDown,
  Eye,
  Info,
  RotateCcw,
  Check,
  ImageIcon
} from 'lucide-react';
import { getPublicProducts } from '../admin/services/productService';

// Fallback catalog in case Supabase is not yet populated or offline
const INITIAL_PRODUCTS = [
  // FRENCH FRIES
  {
    id: 1,
    name: "Crinkle Cut Hungritos",
    category: "fries",
    country: "India",
    description: "Premium crinkle-cut fries offering golden crunch outside with soft, flavorful potato interiors.",
    image: "/Images/hungritos-crinkle.jpg",
    features: ["India origin"],
    badge: "Hungritos",
    rating: 4.8,
    suppliers: 3
  },
  {
    id: 2,
    name: "Frozen Shoestring Acrispy 7×7",
    category: "fries",
    country: "China",
    description: "Classic thin-cut fries delivering crisp texture, light bite, and consistent golden frying results.",
    image: "/Images/acrispy-7x7.jpg",
    badge: "Acrispy",
    features: ["China origin"],
    rating: 4.7,
    suppliers: 4
  },
  {
    id: 3,
    name: "Frozen Shoestring Acrispy 10×10",
    category: "fries",
    country: "China",
    description: "Straight-cut premium fries designed for crispy exteriors and fluffy, satisfying potato centers.",
    image: "/Images/acrispy-10x10.jpg",
    badge: "Acrispy",
    features: ["China origin"],
    rating: 4.8,
    suppliers: 4
  },

  // AUSTRALIAN BEEF
  {
    id: 4,
    name: "Shin Shank",
    category: "beef",
    country: "Australia",
    description: "Flavor-rich beef shank delivering tender chew and deep taste, ideal for slow cooking.",
    image: "/Images/shank.jpg",
    badge: "Premium",
    features: ["Australia origin"],
    rating: 4.9,
    suppliers: 5
  },
  {
    id: 5,
    name: "Beef Bone Brisket Bone CAG",
    category: "beef",
    country: "Australia",
    description: "Collagen-rich marrow bones creating deep, savory stocks with silky, gelatinous texture.",
    image: "/Images/bone.jpg",
    badge: "CAG",
    features: ["Australia origin"],
    rating: 4.8,
    suppliers: 4
  },
  {
    id: 6,
    name: "Beef Leg Bone",
    category: "beef",
    country: "Australia",
    description: "Premium leg bones packed with marrow, producing naturally sweet, full-bodied soup bases.",
    image: "/Images/leg.jpg",
    badge: "Premium",
    features: ["Australia origin"],
    rating: 4.8,
    suppliers: 3
  },
  {
    id: 7,
    name: "Cube Roll Hokubee",
    category: "beef",
    country: "Australia",
    description: "Highly marbled Hokubee cube roll delivering buttery richness and melt-in-mouth steak texture.",
    image: "/Images/hokubee.jpg",
    badge: "Hokubee",
    features: ["Australia origin"],
    rating: 5.0,
    suppliers: 4
  },
  {
    id: 8,
    name: "Striploin Hokubee",
    category: "beef",
    country: "Australia",
    description: "Juicy striploin enhanced with signature marbling for balanced richness and grilling perfection.",
    image: "/Images/352.jpg",
    badge: "Hokubee",
    features: ["Australia origin"],
    rating: 5.0,
    suppliers: 4
  },
  {
    id: 9,
    name: "Frozen Australian Beef Rump",
    category: "beef",
    country: "Australia",
    description: "Lean yet tender beef rump offering robust flavor and versatile performance across cooking styles.",
    image: "/Images/rump.jpg",
    badge: "Premium",
    features: ["Australia origin"],
    rating: 4.7,
    suppliers: 5
  },
  {
    id: 10,
    name: "Australian Minced Beef",
    category: "beef",
    country: "Australia",
    description: "High-quality minced beef with ideal fat balance, ensuring juicy burgers and flavorful dishes.",
    image: "/Images/minced-beef-aus.jpg",
    badge: "Premium",
    features: ["Australia origin"],
    rating: 4.8,
    suppliers: 6
  },

  // CANADIAN BEEF
  {
    id: 11,
    name: "Short Rib (Bone-in)",
    category: "beef",
    country: "Canada",
    description: "Well-marbled short ribs delivering intense beef flavor and succulent texture when grilled.",
    image: "/Images/rib.jpg",
    badge: "Premium",
    features: ["Canada origin"],
    rating: 4.9,
    suppliers: 3
  },
  {
    id: 12,
    name: "Top Blade",
    category: "beef",
    country: "Canada",
    description: "AAA-graded top blade cut featuring superior marbling for tender steaks and barbecue excellence.",
    image: "/Images/blade.jpg",
    badge: "Blue Ribbon",
    features: ["Canada origin"],
    rating: 4.9,
    suppliers: 4
  },

  // USA BEEF
  {
    id: 13,
    name: "US Beef No-Roll Swift Rib Fingers",
    category: "beef",
    country: "USA",
    description: "Versatile rib fingers offering bold beef flavor, perfect for grilling or slow braising.",
    image: "/Images/finger.jpg",
    badge: "Swift",
    features: ["USA origin"],
    rating: 4.8,
    suppliers: 3
  },
  {
    id: 14,
    name: "Clear River Farms Short Plate",
    category: "beef",
    country: "USA",
    description: "Thin-sliced short plate delivering buttery richness and tender bite for hotpot dishes.",
    image: "/Images/plate.jpg",
    badge: "Clear River",
    features: ["USA origin"],
    rating: 4.7,
    suppliers: 4
  },
  {
    id: 15,
    name: "USA Minced Beef",
    category: "beef",
    country: "USA",
    description: "Premium minced beef producing juicy patties, tender crumble, and steak-like savory depth.",
    image: "/Images/minced-beef-usa.jpg",
    badge: "Premium",
    features: ["USA origin"],
    rating: 4.8,
    suppliers: 5
  },

  // AUSTRALIAN LAMB
  {
    id: 16,
    name: "Australian Lamb Leg Boneless",
    category: "lamb",
    country: "Australia",
    description: "Naturally lean lamb leg delivering juicy texture, earthy flavor, and excellent grilling results.",
    image: "/Images/boneless.jpg",
    badge: "Premium",
    features: ["Australia origin"],
    rating: 4.9,
    suppliers: 4
  },

  // CHEESE
  {
    id: 17,
    name: "Mozzarella Cheese – Mlekpol",
    category: "cheese",
    country: "Poland",
    description: "High-elasticity mozzarella offering perfect melt, golden bubbling, and mild milky flavor.",
    image: "/Images/mlekpol.jpg",
    badge: "Mlekpol",
    features: ["Poland origin"],
    rating: 4.9,
    suppliers: 2
  },
  {
    id: 18,
    name: "Pizza Topping Mozzala",
    category: "cheese",
    country: "Poland",
    description: "Specially formulated pizza cheese delivering consistent melt, stretch, and savory richness.",
    image: "/Images/mozzala.jpg",
    badge: "Mozzala",
    features: ["Poland origin"],
    rating: 4.7,
    suppliers: 3
  },

  // BUTTER & MARGARINE
  {
    id: 19,
    name: "Peerless AU Unsalted Butter",
    category: "butter_margarine",
    country: "Australia",
    description: "Clean-tasting butter providing silky melt, balanced richness, and precise culinary control.",
    image: "/Images/peerless-butter.jpg",
    badge: "Peerless",
    features: ["Australia origin"],
    rating: 5.0,
    suppliers: 2
  },
  {
    id: 20,
    name: "Margarine Palffy Unsalted Vivo",
    category: "butter_margarine",
    country: "Singapore",
    description: "Heat-stable margarine offering excellent plasticity and reliable performance in professional baking.",
    image: "/Images/palffy-margarine.jpg",
    badge: "Vivo",
    features: ["Singapore origin"],
    rating: 4.6,
    suppliers: 2
  },

  // OTHERS
  {
    id: 21,
    name: "Urzante Olive Pomace Oil 5L",
    category: "others",
    country: "Spain",
    description: "High smoke-point olive oil ideal for frying, delivering light texture and heat stability.",
    image: "/Images/urzante-oil.jpg",
    badge: "Urzante",
    features: ["Spain origin"],
    rating: 4.8,
    suppliers: 3
  },
  {
    id: 22,
    name: "Ajinomoto Mayonnaise 3kg",
    category: "others",
    country: "Vietnam",
    description: "Creamy mayonnaise delivering rich egg flavor and smooth consistency for versatile applications.",
    image: "/Images/mayo.jpg",
    badge: "Ajinomoto",
    features: ["Vietnam origin"],
    rating: 4.9,
    suppliers: 4
  },
  {
    id: 23,
    name: "Fragata Seedless Black Olives",
    category: "others",
    country: "Spain",
    description: "Naturally ripe black olives offering smooth texture, mild nuttiness, and convenient seedless finish.",
    image: "/Images/fragata-olives.jpg",
    badge: "Fragata",
    features: ["Spain origin"],
    rating: 4.7,
    suppliers: 3
  }
];

const BASE_CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'Frozen Beef', name: 'Frozen Beef' },
  { id: 'Frozen Lamb', name: 'Frozen Lamb' },
  { id: 'Imported Poultry', name: 'Imported Poultry' },
  { id: 'Frozen Seafood', name: 'Frozen Seafood' },
  { id: 'Frozen Potato', name: 'Frozen Potato' },
  { id: 'Butter, Cheese & Dairy', name: 'Butter, Cheese & Dairy' },
  { id: 'Oils, Sauces & Dry Goods', name: 'Oils, Sauces & Dry Goods' }
];

// Helper to match canonical database categories with legacy aliases
const matchesCategoryHelper = (prodCat, filterId) => {
  if (filterId === 'all') return true;
  if (!prodCat) return false;
  if (prodCat === filterId) return true;

  const map = {
    'Frozen Beef': ['Frozen Beef', 'beef'],
    'Frozen Lamb': ['Frozen Lamb', 'lamb'],
    'Imported Poultry': ['Imported Poultry', 'poultry', 'chicken'],
    'Frozen Seafood': ['Frozen Seafood', 'seafood'],
    'Frozen Potato': ['Frozen Potato', 'fries', 'potato'],
    'Butter, Cheese & Dairy': ['Butter, Cheese & Dairy', 'cheese', 'butter_margarine', 'dairy'],
    'Oils, Sauces & Dry Goods': ['Oils, Sauces & Dry Goods', 'others', 'sauces', 'oils']
  };

  const allowed = map[filterId] || [filterId];
  return allowed.some((a) => a.toLowerCase() === prodCat.toLowerCase());
};

// Country flags helper
const getCountryFlag = (country) => {
  if (!country) return '🌐';
  const c = country.toLowerCase().trim();
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('usa') || c.includes('united states')) return '🇺🇸';
  if (c.includes('canada')) return '🇨🇦';
  if (c.includes('poland')) return '🇵🇱';
  if (c.includes('india')) return '🇮🇳';
  if (c.includes('china')) return '🇨🇳';
  if (c.includes('singapore')) return '🇸🇬';
  if (c.includes('spain')) return '🇪🇸';
  if (c.includes('vietnam')) return '🇻🇳';
  if (c.includes('brazil')) return '🇧🇷';
  if (c.includes('argentina')) return '🇦🇷';
  if (c.includes('japan')) return '🇯🇵';
  if (c.includes('chile')) return '🇨🇱';
  if (c.includes('netherlands')) return '🇳🇱';
  if (c.includes('norway')) return '🇳🇴';
  if (c.includes('new zealand')) return '🇳🇿';
  if (c.includes('france')) return '🇫🇷';
  if (c.includes('germany')) return '🇩🇪';
  if (c.includes('ireland')) return '🇮🇪';
  if (c.includes('italy')) return '🇮🇹';
  if (c.includes('uk') || c.includes('united kingdom')) return '🇬🇧';
  if (c.includes('thailand')) return '🇹🇭';
  return '🌐';
};

// Category label helper
const getCategoryLabel = (catId) => {
  switch (catId) {
    case 'Frozen Beef':
    case 'beef':
      return 'Frozen Beef';
    case 'Frozen Lamb':
    case 'lamb':
      return 'Frozen Lamb';
    case 'Imported Poultry':
    case 'poultry':
    case 'chicken':
      return 'Imported Poultry';
    case 'Frozen Seafood':
    case 'seafood':
      return 'Frozen Seafood';
    case 'Frozen Potato':
    case 'fries':
      return 'Frozen Potato';
    case 'Butter, Cheese & Dairy':
    case 'cheese':
    case 'butter_margarine':
      return 'Butter, Cheese & Dairy';
    case 'Oils, Sauces & Dry Goods':
    case 'others':
      return 'Oils, Sauces & Dry Goods';
    default:
      return catId || 'Specialty Product';
  }
};

const ProductsPage = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Load database products on mount
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await getPublicProducts();
        if (!error && data && data.length > 0 && isMounted) {
          const formatted = data.map((item) => ({
            ...item,
            features: Array.isArray(item.features) && item.features.length > 0
              ? item.features
              : item.country ? [`${item.country} origin`] : []
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.warn('Using initial product catalog fallback:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute category counts dynamically (including any custom categories added in CMS)
  const categories = useMemo(() => {
    // Collect all unique categories from products that don't match any of the BASE_CATEGORIES
    const dynamicCategories = [];
    const knownCategoryIds = new Set(BASE_CATEGORIES.map((c) => c.id.toLowerCase()));

    products.forEach((p) => {
      if (p.category) {
        const catTrimmed = p.category.trim();
        const matchesBase = BASE_CATEGORIES.some(
          (base) => base.id !== 'all' && matchesCategoryHelper(catTrimmed, base.id)
        );
        if (!matchesBase) {
          const lower = catTrimmed.toLowerCase();
          if (!knownCategoryIds.has(lower)) {
            knownCategoryIds.add(lower);
            dynamicCategories.push({
              id: catTrimmed,
              name: catTrimmed
            });
          }
        }
      }
    });

    const fullCategoryList = [...BASE_CATEGORIES, ...dynamicCategories];

    return fullCategoryList.map((cat) => {
      const count =
        cat.id === 'all'
          ? products.length
          : products.filter((p) => matchesCategoryHelper(p.category, cat.id)).length;
      return { ...cat, count };
    });
  }, [products]);

  // Derive unique countries from products
  const uniqueCountries = useMemo(() => {
    const rawUniqueCountries = [
      ...new Set(
        products
          .map((p) => (p.country ? p.country.trim() : ''))
          .filter(Boolean)
      )
    ];
    return ['all', ...rawUniqueCountries.sort((a, b) => a.localeCompare(b))];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || matchesCategoryHelper(product.category, selectedCategory);

      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.country &&
          product.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.badge &&
          product.badge.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(product.features) &&
          product.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase())));

      const productCountryNormalized = (product.country || '').trim().toLowerCase();
      const selectedCountryNormalized = selectedCountry.trim().toLowerCase();

      const matchesCountry =
        selectedCountry === 'all' ||
        productCountryNormalized === selectedCountryNormalized;

      return matchesCategory && matchesSearch && matchesCountry;
    });

    // Sorting
    if (sortBy === 'rating-desc') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'country-asc') {
      list.sort((a, b) => (a.country || '').localeCompare(b.country || ''));
    }

    return list;
  }, [products, selectedCategory, searchTerm, selectedCountry, sortBy]);

  // Handle ESC key for Quick View Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setQuickViewProduct(null);
    };
    if (quickViewProduct) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [quickViewProduct]);

  // Chatbase bot loader
  useEffect(() => {
    if (document.getElementById("-96YCJOIt5KH-ZTaX0tyA")) return;

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "-96YCJOIt5KH-ZTaX0tyA";
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const hasActiveFilters = selectedCategory !== 'all' || selectedCountry !== 'all' || searchTerm.trim() !== '' || sortBy !== 'default';

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCountry('all');
    setSortBy('default');
  };

  return (
    <div className="pt-28 sm:pt-32 min-h-screen bg-gradient-to-b from-gray-50/60 via-white to-gray-50/40">
      
      {/* 1. Header Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Our Products
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
            Directly imported premium meats, specialty fries, European dairy, and culinary provisions trusted by leading foodservice operators and distributors globally.
          </p>
        </div>
      </section>

      {/* 2. Beautiful Dedicated Category Filter Bar (Spacious, Never Clipped) */}
      <section className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 p-2 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-full border border-gray-200/70 shadow-sm">
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/15 scale-[1.02]'
                      : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  <span>{category.name}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Search & Control Dock (Sticky, Clean, Elevated) */}
      <section className="sticky top-20 sm:top-24 z-30 px-4 sm:px-6 lg:px-8 py-3 mb-8 bg-white/95 backdrop-blur-xl border-y border-gray-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search cuts, origins, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sourcing Origin & Sort Filters */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Origin Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full sm:w-48 appearance-none bg-gray-50 hover:bg-gray-100/70 text-gray-700 text-xs sm:text-sm font-semibold py-2.5 pl-3.5 pr-8 rounded-xl border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">🌐 All Origins</option>
                {uniqueCountries.filter(c => c !== 'all').map((country) => (
                  <option key={country} value={country.toLowerCase()}>
                    {getCountryFlag(country)} {country}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-44 appearance-none bg-gray-50 hover:bg-gray-100/70 text-gray-700 text-xs sm:text-sm font-semibold py-2.5 pl-3.5 pr-8 rounded-xl border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="default">Default Order</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name (A – Z)</option>
                <option value="name-desc">Name (Z – A)</option>
                <option value="country-asc">Origin (A – Z)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto pt-2.5 mt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-gray-600">
              <span className="font-semibold text-gray-500">Active filters:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-medium">
                  Category: {BASE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCountry !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-medium">
                  Origin: {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}
                  <button onClick={() => setSelectedCountry('all')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchTerm.trim() !== '' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-medium">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-md font-medium">
                  Sorted
                  <button onClick={() => setSortBy('default')} className="hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">
                Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of {products.length} products
              </span>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Products Showcase Grid */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Skeleton Loader */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm animate-pulse flex flex-col"
                >
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-5" />
                  <div className="h-11 bg-gray-200 rounded-2xl w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Refined High-End Product Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => {
                const flag = getCountryFlag(product.country);
                const categoryName = getCategoryLabel(product.category);

                return (
                  <div
                    key={product.id || `${product.name}-${index}`}
                    className="group bg-white rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-4px_rgba(16,185,129,0.12)] hover:border-emerald-600/40 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {/* Visual Stage (Image Area) */}
                    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-50 to-gray-100/80 overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}

                      {/* Generic No product image fallback state */}
                      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50/90 text-gray-400 select-none ${product.image ? 'hidden' : ''}`}>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center mb-2 text-gray-300 group-hover:text-emerald-500 transition-colors">
                          <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400">No product image</span>
                      </div>

                      {/* Origin Badge (Top-Left) */}
                      {product.country && (
                        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-gray-800 shadow-sm border border-white/60">
                          <span className="text-sm leading-none">{flag}</span>
                          <span>{product.country}</span>
                        </div>
                      )}

                      {/* Brand / Quality Badge (Top-Right) */}
                      {product.badge && (
                        <div className="absolute top-4 right-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900/85 backdrop-blur-md text-white shadow-sm border border-white/20">
                          {product.badge}
                        </div>
                      )}

                      {/* Quick View Button on Image Hover */}
                      <div className="absolute inset-0 bg-gray-900/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          className="bg-white/95 hover:bg-white text-gray-900 text-xs font-bold py-2.5 px-4.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      
                      {/* Category Eyebrow & Star Rating */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          {categoryName}
                        </span>
                        
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50/90 border border-amber-200/60 text-xs font-bold text-gray-800 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{Number(product.rating || 4.8).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => setQuickViewProduct(product)}
                        className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Product Description */}
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-2 mb-5">
                        {product.description}
                      </p>

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
                        {(product.features || []).slice(0, 3).map((feature, fIndex) => (
                          <span
                            key={fIndex}
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium bg-gray-50 text-gray-700 border border-gray-200/70"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          title="View Specifications"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Specs</span>
                        </button>

                        <Link
                          to="/contact"
                          state={{ product: product.name, category: product.category }}
                          className="flex-1 bg-gray-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-md hover:shadow-emerald-900/20"
                        >
                          <span>Request Quote</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-200/80 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No matching products found</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                We couldn't find any items matching your active search and filter criteria. Try expanding your search or clearing filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 5. Quick View Modal */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-gray-500 hover:text-gray-900 flex items-center justify-center shadow-md border border-gray-200/70 transition-transform hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Product Photo */}
              <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 min-h-[280px] md:min-h-[380px]">
                {quickViewProduct.image ? (
                  <img
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full max-h-[360px] object-contain rounded-2xl drop-shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.nextElementSibling;
                      if (fb) fb.classList.remove('hidden');
                    }}
                  />
                ) : null}

                {/* Generic No product image fallback state */}
                <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/80 rounded-2xl border border-dashed border-gray-200 text-gray-400 select-none ${quickViewProduct.image ? 'hidden' : ''}`}>
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center mb-2.5 text-gray-300">
                    <ImageIcon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <span className="text-sm font-bold text-gray-600">No product image</span>
                  <span className="text-xs text-gray-400 mt-1 max-w-[200px]">Official imagery can be uploaded via the CMS.</span>
                </div>

                {quickViewProduct.country && (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-gray-800 shadow-sm border border-white/60">
                    <span>{getCountryFlag(quickViewProduct.country)}</span>
                    <span>{quickViewProduct.country}</span>
                  </div>
                )}
                {quickViewProduct.badge && (
                  <div className="absolute bottom-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900/85 backdrop-blur-md text-white shadow-sm">
                    {quickViewProduct.badge}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {getCategoryLabel(quickViewProduct.category)}
                  </span>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/70 text-xs font-bold text-gray-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{Number(quickViewProduct.rating || 4.8).toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">
                  {quickViewProduct.name}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {quickViewProduct.description}
                </p>

                {/* Specs Box */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 mb-6 space-y-2 text-xs">
                  {Array.isArray(quickViewProduct.features) && quickViewProduct.features.find((f) => f.startsWith('FE-')) && (
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Product Code / SKU</span>
                      <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {quickViewProduct.features.find((f) => f.startsWith('FE-'))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-500 font-medium">Origin Country</span>
                    <span className="text-gray-900 font-semibold flex items-center gap-1">
                      {getCountryFlag(quickViewProduct.country)} {quickViewProduct.country || 'Global'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60">
                    <span className="text-gray-500 font-medium">Product Category</span>
                    <span className="text-gray-900 font-semibold">
                      {getCategoryLabel(quickViewProduct.category)}
                    </span>
                  </div>
                  {quickViewProduct.badge && (
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Grade / Brand</span>
                      <span className="text-gray-900 font-semibold">{quickViewProduct.badge}</span>
                    </div>
                  )}
                  {Array.isArray(quickViewProduct.features) && quickViewProduct.features.find((f) => f.startsWith('Delivery: ')) && (
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500 font-medium">Delivery Speed</span>
                      <span className="text-emerald-700 font-semibold">
                        {quickViewProduct.features.find((f) => f.startsWith('Delivery: ')).replace('Delivery: ', '')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500 font-medium">Sourcing Status</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Direct Wholesale & Export
                    </span>
                  </div>
                </div>

                {/* Features Tags */}
                {quickViewProduct.features && quickViewProduct.features.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Highlights</div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickViewProduct.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-200/70"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal CTA */}
                <div className="mt-auto pt-4 flex flex-col gap-2">
                  <Link
                    to="/contact"
                    state={{ product: quickViewProduct.name, category: quickViewProduct.category }}
                    onClick={() => setQuickViewProduct(null)}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-5 rounded-xl text-center text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Request Quote for this Cut</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(null)}
                    className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-semibold transition-colors"
                  >
                    Back to Catalog
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. Official Catalog Disclaimer */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-xs sm:text-sm text-gray-700">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <p className="leading-relaxed">
              <strong>Disclaimer:</strong> Product images are for general reference only. The actual product may vary in appearance and may not fully resemble what is shown.
            </p>
          </div>
        </div>
      </section>

      {/* 7. High-End B2B Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white overflow-hidden shadow-2xl border border-gray-800">
            
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
                Dedicated B2B Sourcing Support
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Ready to Source Premium Products?
              </h2>

              <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Connect with our product specialists to discuss your specific needs and get personalized recommendations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:scale-105"
                >
                  <span>Request Product Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-xl font-bold text-base border border-white/15 transition-all duration-300"
                >
                  <span>About Our Network</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductsPage;