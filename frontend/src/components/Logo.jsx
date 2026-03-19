// Component Logo hình núi và mặt trời - Đồng bộ toàn website
const LogoIcon = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="25" fill="#fbcfe8" fillOpacity="0.6" />
        <path d="M10 80L40 35L60 65L80 45L95 80H10Z" stroke="#0d9488" strokeWidth="4" strokeLinejoin="round" />
        <path d="M35 80L55 55L75 80H35Z" stroke="#0d9488" strokeWidth="4" strokeLinejoin="round" fill="white" />
    </svg>
);

export default LogoIcon;
