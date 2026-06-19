"use client";

export default function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="w-full h-full object-cover"
    >
      <source src="/video/mm.mp4" type="video/mp4" />
      <source src="/video/femme.mp4" type="video/mp4" />
    </video>
  );
}