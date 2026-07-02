export default function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur-xl ${className}`}>
      {title && <h2 className="text-lg font-semibold text-white/90 mb-4">{title}</h2>}
      {children}
    </section>
  );
}
