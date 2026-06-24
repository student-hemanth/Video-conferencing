import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-red-400 text-xl font-bold mb-4">Something went wrong</h2>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap break-words">
              {this.state.error.message}
            </pre>
            <pre className="text-gray-500 text-xs mt-4 whitespace-pre-wrap break-words">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
