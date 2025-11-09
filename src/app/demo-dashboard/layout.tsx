'use client';

import { useEffect } from 'react';

export default function DemoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide navbar and footer for demo dashboard
    const navbar = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (main) {
      main.style.paddingTop = '0';
      main.style.paddingBottom = '0';
    }

    return () => {
      // Restore on unmount
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
      if (main) {
        main.style.paddingTop = '';
        main.style.paddingBottom = '';
      }
    };
  }, []);

  return <>{children}</>;
}
