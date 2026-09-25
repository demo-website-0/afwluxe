import React, { useState } from 'react';
import { X, Crop, ZoomIn, ZoomOut, Check, RefreshCw } from 'lucide-react';
import { cropToFourFiveRatio } from '../../utils/imageCompressor';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !imageSrc) return null;

  const handleApplyCrop = async () => {
    try {
      setIsProcessing(true);
      const cropped = await cropToFourFiveRatio(imageSrc, zoom, offsetY);
      onCropComplete(cropped);
      onClose();
    } catch (e) {
      console.error('Crop error', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Crop size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4:5 Aspect Ratio Cropper</h3>
              <p className="text-[11px] text-slate-500">
                AFW high-fashion portrait standard (4:5 ratio)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4:5 Preview Box */}
        <div className="p-6 bg-slate-100 flex items-center justify-center">
          <div className="relative w-64 h-80 rounded-xl overflow-hidden border-2 border-dashed border-slate-900 shadow-md bg-white flex items-center justify-center">
            {/* Guide Grid */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 border border-slate-900/20 divide-x divide-y divide-slate-900/20" />

            {/* Scaled / Offset Image */}
            <img
              src={imageSrc}
              alt="Crop preview"
              className="w-full h-full object-cover transition-transform duration-75 select-none"
              style={{
                transform: `scale(${zoom}) translateY(${offsetY}px)`,
                transformOrigin: 'center center',
              }}
            />

            <span className="absolute bottom-2 right-2 z-20 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
              4:5 Ratio
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-4">
          {/* Zoom Control */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <ZoomIn size={14} className="text-slate-400" />
                <span>Zoom Scale:</span>
              </span>
              <span className="font-mono">{zoom.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Vertical Alignment */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span>Vertical Position:</span>
              <span className="font-mono">{offsetY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={offsetY}
              onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
              className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffsetY(0);
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApplyCrop}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                <span>{isProcessing ? 'Cropping...' : 'Apply 4:5 Crop'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
