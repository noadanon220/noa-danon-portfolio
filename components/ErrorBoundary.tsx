
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  // Making children optional helps resolve TypeScript errors where children are not correctly detected in JSX
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
// Use React.Component directly to ensure 'props' and 'state' are correctly inherited from the base class
export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state and props to fix TypeScript property access errors reported in certain environments
  public state: State;
  public props: Props;

  // Fix: Use constructor to ensure 'props' and 'state' are correctly inherited and recognized by the type system
  constructor(props: Props) {
    super(props);
    // Explicitly initialize state and props to ensure visibility to the compiler
    this.props = props;
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    // Correctly accessing state from the class instance
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-6 text-center">
          <div className="bg-white p-12 rounded-[3rem] puffy-shadow max-w-md">
            <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-rose-500 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold font-fredoka text-gray-800 mb-4">Whoops!</h1>
            <p className="text-gray-600 mb-8">
              Something went a little squishy. The page encountered an unexpected error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="puffy-button bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCcw size={20} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Accessing children from this.props which is now correctly inherited from React.Component
    return this.props.children;
  }
}
