require('./bootstrap');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Create root and render the App component
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(React.createElement(App));
