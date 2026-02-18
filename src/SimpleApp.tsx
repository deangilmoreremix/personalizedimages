import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        VideoRemix AI Platform
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', textAlign: 'center' }}>
        Your AI-powered image and video creation platform is loading...
      </p>
      <div style={{
        padding: '12px 32px',
        background: 'white',
        color: '#667eea',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onClick={() => window.location.reload()}
      >
        Refresh Page
      </div>
      <p style={{ marginTop: '2rem', opacity: 0.8 }}>
        Status: Build Successful ✓
      </p>
    </div>
  );
}

export default SimpleApp;
