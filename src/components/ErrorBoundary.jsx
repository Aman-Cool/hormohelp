import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFBEF] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-[#FFF3CC] border border-[#E8D88A] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-navy mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              An unexpected error occurred. Your data is safe — try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-navy text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
