import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }
  componentDidCatch(error, info) {
    this.setState({ error, info })
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#f87171', fontFamily: 'monospace', background: '#020c18', minHeight: '100vh' }}>
          <h1 style={{ color: '#fbbf24', fontSize: 20 }}>Runtime Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#f87171', marginTop: 16 }}>
            {this.state.error.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#94a3b8', marginTop: 16 }}>
            {this.state.info?.componentStack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
