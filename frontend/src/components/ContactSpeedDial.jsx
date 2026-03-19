import React, { useState } from 'react';
import { FaFacebookF, FaPhoneAlt, FaMapMarkerAlt, FaTiktok, FaTimes, FaCommentDots } from 'react-icons/fa';

const ContactSpeedDial = () => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { 
            icon: <FaFacebookF />, 
            name: 'Facebook', 
            color: 'bg-[#3b5998]', 
            link: 'https://www.facebook.com/share/18Sz5bUFKX/?mibextid=wwXIfr',
            shadow: 'shadow-[#3b5998]/40'
        },
        { 
            icon: <FaPhoneAlt />, 
            name: 'Gọi ngay: 0354 858 892', 
            color: 'bg-[#25d366]', 
            link: 'tel:0354858892',
            shadow: 'shadow-[#25d366]/40'
        },
        { 
            icon: <FaMapMarkerAlt />, 
            name: 'Google Maps', 
            color: 'bg-[#4285F4]', 
            link: 'https://www.google.com/maps/search/?api=1&query=273+Nguyễn+Văn+Linh,+Long+Tuyền,+Bình+Thủy,+Cần+Thơ',
            shadow: 'shadow-[#4285F4]/40'
        },
        { 
            icon: <FaTiktok />, 
            name: 'TikTok', 
            color: 'bg-[#000000]', 
            link: 'https://tiktok.com',
            shadow: 'shadow-black/40'
        },
    ];

    return (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-4">
            {/* Speed Dial Actions */}
            <div className={`flex flex-col items-start gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {actions.map((action, index) => (
                    <div 
                        key={index} 
                        className="flex items-center gap-3 group"
                        style={{ transitionDelay: `${index * 50}ms` }}
                    >
                        {/* Action Button */}
                        <a
                            href={action.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-12 h-12 ${action.color} text-white rounded-full flex items-center justify-center text-xl shadow-xl ${action.shadow} hover:scale-110 active:scale-95 transition-all duration-300`}
                        >
                            {action.icon}
                        </a>

                        {/* Label */}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-md text-navy px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border border-gray-100 whitespace-nowrap">
                            {action.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl transition-all duration-500 transform ${isOpen ? 'bg-red-500 rotate-180' : 'bg-[#1a5f2e] hover:bg-[#25823f]'} text-white group relative`}
            >
                {isOpen ? (
                    <FaTimes />
                ) : (
                    <>
                        <FaCommentDots className="animate-bounce-slow" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                        </span>
                    </>
                )}
                
                {/* Ripple Effect when closed */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-[#1a5f2e] animate-ping opacity-20 pointer-events-none"></span>
                )}
            </button>
        </div>
    );
};

export default ContactSpeedDial;
