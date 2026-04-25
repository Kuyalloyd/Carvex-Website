import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
    return (
        <div className={`toast toast-${type}`}>
            <p>{message}</p>
            <button onClick={onClose}>×</button>
        </div>
    );
}
