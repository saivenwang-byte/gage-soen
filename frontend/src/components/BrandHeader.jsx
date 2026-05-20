import { config } from '../brand';

export default function BrandHeader({ title, subtitle }) {
  return (
    <header className="app-header">
      <p className="brand-mark">{config.name}</p>
      <h1>{title || config.tagline}</h1>
      <p className="brand-slogan">{subtitle || config.slogan}</p>
    </header>
  );
}
