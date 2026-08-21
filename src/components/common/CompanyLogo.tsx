import React, { useState } from 'react';

// Map company names to local high-fidelity assets served statically by the backend/vite proxy
const getLocalLogoPath = (companyName: string): string | undefined => {
  if (!companyName) return undefined;
  const name = companyName.toLowerCase().trim();

  // 1. Top Recruiter Logos (served from root /image)
  if (name === 'tcs' || name.includes('tata consultancy')) return '/image/TCS.webp';
  if (name.includes('infosys')) return '/image/Infosys.webp';
  if (name.includes('wipro')) return '/image/Wipro.webp';
  if (name.includes('capgemini')) return '/image/Capgemini.svg';
  if (name.includes('cognizant')) return '/image/Cognizant.png';
  if (name.includes('deloitte')) return '/image/Deloitte.png';
  if (name.includes('accenture')) return '/image/Accenture.webp';
  if (name.includes('tech mahindra')) return '/image/Tech_Mahindra.webp';

  // 2. Off-Campus & Global Brand Logos (served from /image/Logos)
  if (name.includes('google pay') || name.includes('gpay')) return '/image/Logos/Google-Pay-logo-vector.png';
  if (name.includes('google')) return '/image/Logos/google-logo-400x400.png';
  if (name.includes('microsoft')) return '/image/Logos/new-microsoft-logo-2012-logo-vector-01-400x400.png';
  if (name.includes('amazon')) return '/image/Logos/amazon-logo-preview-400x400.png';
  if (name.includes('facebook') || name.includes('meta')) return '/image/Logos/facebook-logo-preview-400x400.png';
  if (name.includes('apple')) return '/image/Logos/apple-inc-vector-logo-400x400.png';
  if (name.includes('adidas')) return '/image/Logos/Adidas-logo-400x400.png';
  if (name.includes('nike')) return '/image/Logos/nike-logo-vector-download-400x400.jpg';
  if (name.includes('puma')) return '/image/Logos/puma-logo-400x400.png';
  if (name.includes('netflix')) return '/image/Logos/netflix-logo-vector-400x400.png';
  if (name.includes('spotify')) return '/image/Logos/spotify-logo-400x400.png';
  if (name.includes('starbucks')) return '/image/Logos/starbucks-logo-preview-400x400.png';
  if (name.includes('tesla')) return '/image/Logos/tesla-logo-vector-download-400x400.jpg';
  if (name.includes('uber')) return '/image/Logos/uber-logo-vector.png';
  if (name.includes('flipkart')) return '/image/Logos/flipkart-logo-vector-download-400x400.jpg';
  if (name.includes('paypal')) return '/image/Logos/paypal-logo-preview-400x400.png';
  if (name.includes('disney')) return '/image/Logos/disney-logo-vector-400x400.png';
  if (name.includes('toyota')) return '/image/Logos/toyota-logo-vector-download-400x400.jpg';
  if (name.includes('ford')) return '/image/Logos/ford-logo.png';
  if (name.includes('bmw')) return '/image/Logos/bmw-vector-logo-400x400.png';
  if (name.includes('mercedes')) return '/image/Logos/mercedes-benz-logo-vector-free-download.png';
  if (name.includes('pepsi')) return '/image/Logos/pepsi-logo-vector-01-400x400.png';
  if (name.includes('coca-cola') || name.includes('coca cola')) return '/image/Logos/coca-cola-logo-400x400.png';
  if (name.includes('mcdonald')) return '/image/Logos/mcdonald-vector-400x400.jpg';
  if (name.includes('kfc')) return '/image/Logos/kfc-new-vector-400x400.jpg';
  if (name.includes('subway')) return '/image/Logos/subway-logo-preview-400x400.jpg';
  if (name.includes('domino')) return '/image/Logos/dominos-pizza-logo.png';
  if (name.includes('mastercard')) return '/image/Logos/mastercard-logo-400x400.png';
  if (name.includes('intel')) return '/image/Logos/intel-core-i5-logo-vector-400x400.png';
  if (name.includes('ibm')) return '/image/Logos/ibm-logo-vector-download-400x400.jpg';
  if (name.includes('hp')) return '/image/Logos/hp-logo-vector-download-400x400.jpg';
  if (name.includes('dell')) return '/image/Logos/dell-logo-preview-400x400.png';
  if (name.includes('lenovo')) return '/image/Logos/new-lenovo-logo-400x400.png';
  if (name.includes('asus')) return '/image/Logos/asus-logo-vector-400x400.png';
  if (name.includes('sony')) return '/image/Logos/sony-corporation-vector-logo-400x400.png';
  if (name.includes('panasonic')) return '/image/Logos/panasonic-logo-vector-01.png';
  if (name.includes('lg')) return '/image/Logos/lg-lifes-good-logo-400x400.png';
  if (name.includes('samsung')) return '/image/Logos/samsung-logo-preview-400x400.png';
  if (name.includes('xiaomi')) return '/image/Logos/xiaomi-logo-vector-download.jpg';
  if (name.includes('oppo')) return '/image/Logos/oppo-smartphone-logo-seeklogo-400x400.png';
  if (name.includes('twitter')) return '/image/Logos/twitter-logo.png';
  if (name.includes('instagram')) return '/image/Logos/instagram-logo-400x400.png';
  if (name.includes('whatsapp')) return '/image/Logos/whatsapp-logo.png';
  if (name.includes('snapchat')) return '/image/Logos/snapchat-logo-preview-400x400.png';
  if (name.includes('youtube')) return '/image/Logos/youtube-logo.png';
  if (name.includes('linkedin')) return '/image/Logos/linkedin-logo-512x512.png';

  // 3. Local Brand / Fintech Placeholder Mappings
  if (name.includes('zomato')) return '/image/Logos/dominos-pizza-logo.png'; // Domino's Pizza as high-quality food/delivery placeholder
  if (name.includes('phonepe')) return '/image/Logos/Google-Pay-logo-vector.png'; // GPay as payment placeholder
  if (name.includes('cred')) return '/image/Logos/mastercard-logo-400x400.png'; // Mastercard as premium fintech card placeholder

  // 4. Default Seeded Local Placement Companies
  if (name.includes('techcorp')) return '/image/Logos/c4-engineering-technology-vector-logo-400x400.png';
  if (name.includes('apex analytics')) return '/image/Logos/Google-Chrome-logo-vector-download.png';
  if (name.includes('cloudscale')) return '/image/Logos/Google-Drive-logo-vector.png';
  if (name.includes('nextgen digital')) return '/image/Logos/Android-app-on-Google-play-badge-vector.png';
  if (name.includes('cognitive ai')) return '/image/Logos/Google-Calendar-icon.png';

  return undefined;
};

interface CompanyLogoProps {
  src?: string;
  name: string;
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ src, name, className = "w-12 h-12 rounded-xl" }) => {
  const [error, setError] = useState(false);

  // Generate a consistent color based on company name
  const getGradient = (companyName: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-violet-600 to-fuchsia-700',
      'from-cyan-500 to-blue-600',
    ];
    let hash = 0;
    const cleanName = companyName || 'Company';
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const localPath = getLocalLogoPath(name);
  const finalSrc = localPath || src;

  if (error || !finalSrc) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const gradient = getGradient(name);
    return (
      <div className={`${className} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-2xs select-none border border-slate-200/50 shrink-0`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={name}
      className={`${className} object-contain bg-white p-1 border border-slate-100 shrink-0`}
      onError={() => setError(true)}
    />
  );
};
