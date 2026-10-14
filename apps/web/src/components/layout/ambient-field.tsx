const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function AmbientField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div
        className="absolute -left-[20vw] -top-[25vh] h-[80vh] w-[80vw] rounded-full opacity-70 motion-safe:animate-[drift-a_38s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-a), transparent)" }}
      />
      <div
        className="absolute -right-[15vw] top-[10vh] h-[75vh] w-[65vw] rounded-full opacity-55 motion-safe:animate-[drift-b_46s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-b), transparent)" }}
      />
      <div
        className="absolute -bottom-[30vh] left-[20vw] h-[70vh] w-[60vw] rounded-full opacity-35 motion-safe:animate-[drift-c_54s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(closest-side, var(--field-c), transparent)" }}
      />
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: grain, opacity: "var(--grain-opacity)" }}
      />
    </div>
  );
}
