import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error, errorInfo) {
        // Update state so the next render will show the fallback UI
        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console for debugging
        console.error('Error caught by Error Boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    margin: '20px',
                    background: '#fdede6',
                    border: '2px solid #f87171',
                    borderRadius: '8px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#dc2626'
                }}>
                    <h1>Application Error</h1>
                    <p><strong>Something went wrong:</strong></p>
                    <pre style={{
                        background: '#fff7f5',
                        padding: '10px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '12px'
                    }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <details style={{ marginTop: '10px', fontSize: '12px' }}>
                        <summary>Error Details</summary>
                        <pre style={{
                            background: '#fff7f5',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            marginTop: '10px'
                        }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                    <p style={{ marginTop: '15px', fontSize: '14px' }}>
                        <strong>Check the browser console (F12) for more details.</strong>
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
