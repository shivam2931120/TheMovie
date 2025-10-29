import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container-page py-8">
          <div className="rounded-md border border-red-800 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Something went wrong.</p>
            <p className="mt-1 text-sm opacity-80">{String(this.state.error?.message || this.state.error)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
