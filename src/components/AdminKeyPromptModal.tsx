import React, { useState, useEffect, useRef } from "react";
import { Shield, Lock, KeyRound, CheckCircle2, AlertCircle, X, Eye, EyeOff } from "lucide-react";

interface AdminKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_KEY = "77490869";

export const AdminKeyPromptModal: React.FC<AdminKeyPromptModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKeyInput("");
      setError(null);
      setIsSuccess(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyInput.trim();

    if (!clean) {
      setError("Please enter the Admin Key.");
      return;
    }

    if (clean === REQUIRED_KEY) {
      setError(null);
      setIsSuccess(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(80);
      }
      setTimeout(() => {
        onSuccess();
      }, 450);
    } else {
      setError("Invalid Key. Access Denied.");
      setIsSuccess(false);
    }
  };

  return (
    <div
      id="admin-key-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#090b10] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          id="close-admin-key-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Shield Glow Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 mb-4">
          {isSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-in zoom-in-50 duration-200" />
          ) : (
            <Shield className="w-8 h-8" />
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white tracking-tight">
          Admin Access Vault
        </h3>
        <p className="text-xs text-neutral-400 mt-1.5 mb-6 max-w-xs leading-relaxed">
          Enter the secret key to unlock Studio Admin access, realtime users & feed management.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              id="admin-key-input"
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError(null);
              }}
              placeholder="Enter Key (77490869)"
              maxLength={16}
              className={`w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-900/90 border text-neutral-100 text-center tracking-[0.25em] text-sm outline-none transition-all font-mono placeholder:text-neutral-600 placeholder:tracking-normal ${
                error
                  ? "border-red-500/80 focus:border-red-500"
                  : isSuccess
                  ? "border-emerald-500 text-emerald-300"
                  : "border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
              }`}
            />
            <button
              type="button"
              id="toggle-key-visibility-btn"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Feedback message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-950/40 border border-red-800/40 py-2 px-3 rounded-xl animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 py-2 px-3 rounded-xl animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Key verified! Unlocking Admin Portal...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="admin-key-submit-btn"
            disabled={isSuccess}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
