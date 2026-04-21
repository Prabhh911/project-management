import { Component } from "react";

// Add this to your src/components/ folder
// Wrap <App /> or <Layout /> with it to catch ALL render crashes
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("React crash caught by ErrorBoundary:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-zinc-950 gap-4 p-6">
                    <div className="text-5xl">💥</div>
                    <p className="text-xl font-semibold text-zinc-800 dark:text-white">Something crashed</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                        Open DevTools (F12) → Console to see the exact error.
                    </p>
                    <pre className="text-xs text-red-500 bg-red-50 dark:bg-red-950 p-4 rounded max-w-2xl w-full overflow-auto max-h-48">
                        {this.state.error?.message}
                        {"\n"}
                        {this.state.error?.stack?.split("\n").slice(0, 6).join("\n")}
                    </pre>
                    <button
                        onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                        className="px-5 py-2 text-sm rounded bg-blue-500 text-white hover:opacity-90"
                    >
                        Reload App
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
