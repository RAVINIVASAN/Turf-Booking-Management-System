import { Component } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6 p-4 bg-red-50 rounded-full w-fit mx-auto">
              <AlertCircle size={48} className="text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support.
            </p>

            {import.meta.env.DEV && (
              <pre className="bg-gray-100 p-4 rounded-lg text-left text-xs text-red-600 mb-6 overflow-auto max-h-32">
                {this.state.error?.message}
              </pre>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.resetError}
                variant="primary"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
