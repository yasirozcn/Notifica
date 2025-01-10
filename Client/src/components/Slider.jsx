/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useEffect, useState } from 'react';

const Slider = ({ images, speed = 1 }) => {
  const sliderRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let lastTime = 0;
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused) {
        setTranslateX((prev) => {
          const next = prev + speed * (delta * 0.1);
          const max = slider.scrollWidth / 2;
          return next >= max ? 0 : next <= 0 ? max : next;
        });
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [speed, isPaused]);

  return (
    <div
      className="overflow-hidden relative w-full h-64"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={sliderRef}
        className="flex w-max"
        style={{ transform: `translateX(-${translateX}px)` }}
      >
        {[...images, ...images].map((image, index) => (
          <div key={index} className="flex-shrink-0">
            <img
              src={image}
              alt={`Slide ${index}`}
              className="w-auto h-64 object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
