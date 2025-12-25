import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const springValues = {
  damping: 30,
  stiffness: 150,
  mass: 1
};

export default function TiltedCard({
  children,
  containerHeight = '100%',
  containerWidth = '100%',
  scaleOnHover = 1.02,
  rotateAmplitude = 8,
  className = '',
  onClick,
  style = {}
}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const brightness = useSpring(1, springValues);

  const [isHovered, setIsHovered] = useState(false);

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }

  function handleMouseEnter() {
    setIsHovered(true);
    scale.set(scaleOnHover);
    brightness.set(1.1);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    scale.set(1);
    brightness.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={`relative [perspective:800px] ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth,
        ...style
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] will-change-transform cursor-pointer"
        style={{
          rotateX,
          rotateY,
          scale,
        }}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500/20 via-accent-500/10 to-brand-500/20 blur-xl opacity-0 transition-opacity duration-300 -z-10"
          animate={{ opacity: isHovered ? 0.6 : 0 }}
        />
        
        {/* Card content */}
        <div className="relative w-full h-full [transform:translateZ(0)]">
          {children}
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

