import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ masterLabel, mastersLink = '/customer-master' }) {
  return (
    <div className="breadcrumb">
      <nav>
        <Link to="/">Dashboard</Link>
        <span>›</span>
        <Link to={mastersLink}>Masters</Link>
        <span>›</span>
        <span className="current">{masterLabel}</span>
      </nav>
    </div>
  );
}
