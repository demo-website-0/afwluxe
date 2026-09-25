import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { useAdminData } from '../context/AdminDataContext';
import { LegalPolicy } from '../types';

interface LegalPolicyModalProps {
  policyKey: 'returnPolicy' | 'privacyPolicy' | 'termsOfService' | 'shippingPolicy' | null;
  onClose: () => void;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  policyKey,
  onClose,
}) => {
  const { cmsContent } = useAdminData();

  if (!policyKey || !cmsContent.legalPages) return null;

  const policy: LegalPolicy = cmsContent.legalPages[policyKey];
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1C1C]">{policy.title}</h3>
              <span className="text-[11px] text-stone-400">
                Last updated: {policy.lastUpdated || 'September 2026'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
          {policy.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 flex justify-end bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1C1C] hover:bg-[#2B0F15] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
