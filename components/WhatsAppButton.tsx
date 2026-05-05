"use client";

import React, { useEffect, useState } from "react";

const WhatsAppButton: React.FC = () => {
  const [isNearFooter, setIsNearFooter] = useState(false);

  const phoneNumber = "919876543210";
  const message = "Hi, I want to enquire about your services";

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  useEffect(() => {
    const footer = document.getElementById("footer-end");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearFooter(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed right-5 z-[9999] md:hidden transition-all duration-500 ease-in-out ${
        isNearFooter ? "bottom-28" : "bottom-5"
      }`}
    >
      <div className="hover:scale-110 transition flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg">

        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 24"
          className="w-6 h-6"
          fill="currentColor"
        >
          <path d="M16 .4C7.2.4.2 7.4.2 16.2c0 2.9.8 5.7 2.3 8.2L.1 31.9l7.7-2.3c2.4 1.3 5.1 2 7.9 2h.1c8.8 0 15.8-7 15.8-15.8S24.8.4 16 .4zm0 28.9c-2.5 0-5-.7-7.1-2l-.5-.3-4.6 1.4 1.4-4.5-.3-.5c-1.4-2.2-2.2-4.7-2.2-7.3 0-7.7 6.3-14 14-14s14 6.3 14 14-6.3 14-14 14zm7.6-10.5c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.5-.2-.7.2-.2.3-.8 1.2-1 1.5-.2.2-.3.3-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.2-.7.2-.2.3-.3.5-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1 3 1.2 3.2c.2.2 2 3 4.9 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.8-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.7-.4z" />
        </svg>

        {/* Text */}
        <span className="hidden sm:block text-sm font-medium">
          Chat with us
        </span>
      </div>
    </a>
  );
};

export default WhatsAppButton;