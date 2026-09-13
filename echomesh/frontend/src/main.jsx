import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EchoMesh Global Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-card p-6 border-red-500/50 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400 mx-auto flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white font-mono">EchoMesh Tactical Mesh Recovery</h2>
            <p className="text-xs text-text-secondary font-mono">
              A temporary interface exception occurred ({this.state.error?.message || 'Component render notice'}). The mesh network state is intact.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('echomesh_paired_bt_devices');
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-lg cursor-pointer"
            >
              🔄 Reload & Reset Cache
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
