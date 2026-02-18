import React from 'react';

// Minimal test component
function AppTest() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
        VideoRemix App is Working!
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
        The app is rendering correctly.
      </p>
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
      onClick={() => alert('Button clicked!')}
      >
        Test Button
      </div>
    </div>
  );
}

export default AppTest;
