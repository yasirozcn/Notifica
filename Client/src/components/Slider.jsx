/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useEffect, useState } from 'react';

const Slider = ({ images, speed = 1 }) => {
  const sliderRef = useRef(null);
  const scrollAmount = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef(null); // requestAnimationFrame referansı

  useEffect(() => {
    const slider = sliderRef.current;

    const animate = () => {
      if (!isPaused && slider) {
        scrollAmount.current += speed; // speed negatif olabilir

        // Sonsuz döngü efekti
        if (speed > 0 && scrollAmount.current >= slider.scrollWidth / 2) {
          scrollAmount.current = 0;
        } else if (speed < 0 && scrollAmount.current <= 0) {
          scrollAmount.current = slider.scrollWidth / 2;
        }

        slider.style.transform = `translateX(-${scrollAmount.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate); // Yeni animasyonu sakla
    };

    // İlk animasyonu başlat
    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current); // Temizlik işlemi
  }, [speed, isPaused]);

  return (
    <div
      className="overflow-hidden relative w-full h-64"
      onMouseEnter={() => setIsPaused(true)} // Hover durumunda durdur
      onMouseLeave={() => setIsPaused(false)} // Hover bittiğinde devam ettir
    >
      <div
        ref={sliderRef}
        className="flex w-max"
        style={{ whiteSpace: 'nowrap' }}
      >
        {[...images, ...images].map(
          (
            image,
            index // Sonsuzluk için görselleri iki kere döngüye sok
          ) => (
            <div key={index} className="flex-shrink-0">
              <img
                src={image}
                alt={`Slide ${index}`}
                className="w-auto h-64 object-cover"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Slider;
