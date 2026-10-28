import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }

  static getDerivedStateFromError(err) { return { error: err }; }

  componentDidCatch(err, info) {
    console.error('NexusOne crashed:', err, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'grid', placeItems: 'center',
          background: '#0a0c1a', color: '#c5caf0', textAlign: 'center', padding: 24,
        }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#7880a8', marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              style={{
                padding: '10px 28px', border: 0, borderRadius: 10,
                background: '#4338ca', color: '#fff', fontWeight: 600,
                cursor: 'pointer', fontSize: '1rem',
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
