"use client";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    // TODO: log to monitoring service
    console.error("ErrorBoundary caught", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm">
          Une erreur est survenue. Veuillez réessayer.
        </div>
      );
    }
    return this.props.children;
  }
}
