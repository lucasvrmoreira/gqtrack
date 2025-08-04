// src/components/VantaBackground.jsx
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const VantaBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          backgroundColor: 0x0,
          amplitudeFactor: 3.00,
          xOffset: -0.12,
          yOffset: -0.09,
          size: 1.80
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="absolute inset-0 z-0" />;
};

export default VantaBackground;
