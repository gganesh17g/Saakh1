import { Component, type ErrorInfo, type ReactNode } from "react";
type Props = {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
};
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Saakh rendering error", error, info.componentStack);
  }
  retry = () => this.setState({ error: null });
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.retry);
    return (
      <main
        className="card"
        role="alert"
        style={{ maxWidth: 720, margin: "40px auto", padding: 30 }}
      >
        <h1>Saakh could not open this view</h1>
        <p>
          Your saved simulations have not been cleared. The error below may help
          identify a failed asset, browser feature, or application issue.
        </p>
        <pre>{error.message}</pre>
        <div className="actions">
          <button className="button" onClick={this.retry}>
            Try rendering again
          </button>
          <button
            className="button secondary"
            onClick={() => window.location.reload()}
          >
            Reload application
          </button>
          <a className="button secondary" href={import.meta.env.BASE_URL}>
            Return to Saakh
          </a>
        </div>
        <p>
          If this followed a deployment, wait for it to finish and reload.
          Persistent errors should be reported with this message and the browser
          console details.
        </p>
      </main>
    );
  }
}
