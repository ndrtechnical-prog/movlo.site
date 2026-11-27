import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "An unexpected error occurred while rendering this view."
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("MOVLO UI ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#0A0A0A] flex items-center justify-center px-6 py-16">
          <div className="max-w-lg w-full border border-neutral-200 p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-3">
              Application Notice
            </p>
            <h1 className="font-editorial text-2xl font-bold text-[#0A0A0A] mb-3">
              Something interrupted this page
            </h1>
            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-[#0A0A0A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
