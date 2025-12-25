export default function RainbowButton({ 
  children, 
  onClick, 
  href, 
  target,
  rel,
  className = '',
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  const buttonContent = (
    <>
      <style>{`
        @keyframes rainbow-rotate {
          100% {
            transform: rotate(1turn);
          }
        }
    
        .rainbow-border::before {
          content: '';
          position: absolute;
          z-index: -2;
          left: -50%;
          top: -50%;
          width: 200%;
          height: 200%;
          background-position: 0% 0%;
          background-repeat: no-repeat;
          background-size: 50% 50%, 50% 50%;
          background-image: 
            conic-gradient(
              from 0deg,
              #a4c837,
              #c8de87,
              #989667,
              #a4c837
            );
          animation: rainbow-rotate 3s linear infinite;
        }

        .rainbow-border::after {
          content: '';
          position: absolute;
          z-index: -1;
          left: 2px;
          top: 2px;
          width: calc(100% - 4px);
          height: calc(100% - 4px);
          background: #111311;
          border-radius: 9999px;
        }
      `}</style>
      <div className={`rainbow-border relative z-0 overflow-hidden p-[2px] flex items-center justify-center rounded-full hover:scale-105 transition-all duration-300 active:scale-100 ${className}`}>
        <span className={`relative z-10 ${sizeClasses[size]} text-white rounded-full font-semibold bg-surface-950/90 backdrop-blur-sm flex items-center gap-2 hover:bg-surface-900/90 transition-colors`}>
          {children}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-block">
      {buttonContent}
    </button>
  );
}

