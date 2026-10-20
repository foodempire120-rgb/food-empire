import React from 'react';
import { Download, FileText } from 'lucide-react';

const DownloadCatalogueButton = () => {
  const catalogueUrl = '/Food Empire - Product Catalogue (A3) - Sep 2026.pdf';
  const downloadFilename = 'Food Empire - Product Catalogue.pdf';

  return (
    <div
      className="fixed z-40 right-[20px] bottom-[92px]"
      style={{
        pointerEvents: 'auto',
      }}
    >
      <a
        href={catalogueUrl}
        download={downloadFilename}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Product Catalogue (PDF)"
        title="Download Product Catalogue (PDF)"
        className="group relative flex items-center justify-center w-[60px] h-[60px] rounded-full bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-900/25 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Download icon sized proportionally */}
        <Download className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-y-0.5" />

        {/* Small "PDF" badge */}
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm leading-none tracking-wider">
          PDF
        </span>

        {/* Desktop Tooltip appearing to the left on hover */}
        <span
          role="tooltip"
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-2 border border-gray-700/60"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download Catalogue</span>
          <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-1.5 py-0.5 rounded">
            9.3 MB
          </span>
        </span>
      </a>
    </div>
  );
};

export default DownloadCatalogueButton;
