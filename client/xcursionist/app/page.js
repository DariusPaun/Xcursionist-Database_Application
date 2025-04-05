'use client';
import React from 'react';
import App from '../components/App';  // Import your class component
import { CardWithForm } from '@/components/excursii_card';
import logo from '../components/assets/Xcur_empty-removebg-preview.png';
console.log(logo);

export default function Home() {
  return (
    <div>
      <App />
    </div>
  );
}
