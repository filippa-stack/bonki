import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import JagIMigProductHome from '@/components/JagIMigProductHome';
import JagMedAndraProductHome from '@/components/JagMedAndraProductHome';
import JagIVarldenProductHome from '@/components/JagIVarldenProductHome';
import SexualitetProductHome from '@/components/SexualitetProductHome';

/**
 * Injects product-specific CSS variables onto :root so the entire
 * design system (buttons, accents, text) adapts to each product.
 */
function useProductTheme(primary: string, accent: string) {
  useEffect(() => {
    const root = document.documentElement;
    // Parse HSL: 'hsl(350, 28%, 58%)' → '350, 28%, 58%'
    const parseHSL = (hsl: string) => hsl.replace(/hsl\(([^)]+)\)/, '$1').trim();
    const p = parseHSL(primary);
    const a = parseHSL(accent);

    // Primary → CTA buttons, session header
    root.style.setProperty('--cta-default', `hsl(${p})`);
    root.style.setProperty('--cta-hover-v2', primary);
    root.style.setProperty('--cta-active', primary);
    root.style.setProperty('--cta-bg', primary);
    root.style.setProperty('--session-header-bg', primary);

    // Accent → saffron-equivalent tokens
    root.style.setProperty('--accent-saffron', `hsl(${a})`);
    root.style.setProperty('--accent-text', `hsl(${a})`);

    return () => {
      // Clean up on unmount — restore defaults
      ['--cta-default', '--cta-hover-v2', '--cta-active', '--cta-bg',
       '--session-header-bg', '--accent-saffron', '--accent-text',
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [primary, accent]);
}

export default function ProductHome() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  useThemeSwitcher();

  const product = allProducts.find((p) => p.slug === slug);

  // Always call hooks — use fallback values if product not found
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface-base)' }}>
        <div className="text-center space-y-4">
          <p className="font-serif text-lg" style={{ color: 'var(--text-primary)' }}>Produkten hittades inte</p>
          <button
            onClick={() => navigate('/?devState=library')}
            className="font-serif text-sm underline"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ← Tillbaka till biblioteket
          </button>
        </div>
      </div>
    );
  }

  // Custom layout for Jag i Mig
  if (product.id === 'jag_i_mig') {
    return <JagIMigProductHome product={product} />;
  }

  // Custom layout for Jag med Andra
  if (product.id === 'jag_med_andra') {
    return <JagMedAndraProductHome product={product} />;
  }

  // Custom layout for Jag i Världen
  if (product.id === 'jag_i_varlden') {
    return <JagIVarldenProductHome product={product} />;
  }

  // Custom layout for Sexualitet
  if (product.id === 'sexualitetskort') {
    return <SexualitetProductHome product={product} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-5 pt-14 pb-4"
      >
        <button
          onClick={() => navigate('/?devState=library')}
          className="flex items-center gap-1.5 font-serif text-sm mb-6"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Biblioteket
        </button>

        {/* Product hero — mirrors Still Us: bg=cta-active, subtitle=accent-saffron */}
        <div
          className="rounded-2xl px-6 py-8 text-center"
          style={{
            background: 'var(--cta-active)',
            boxShadow: `0 1px 2px 0 hsla(0,0%,0%,0.06), 0 4px 12px -2px hsla(0,0%,0%,0.12), 0 12px 32px -4px hsla(0,0%,0%,0.14), 0 28px 72px -8px hsla(0,0%,0%,0.10)`,
          }}
        >
          <h1
            className="font-serif"
            style={{ fontSize: '28px', fontWeight: 700, color: 'hsla(0,0%,100%,0.95)', marginBottom: '6px' }}
          >
            {product.name}
          </h1>
          <p
            className="font-serif"
            style={{ fontSize: '14px', color: 'var(--accent-saffron)', opacity: 0.75, lineHeight: 1.5 }}
          >
            {product.description}
          </p>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        className="px-5 pb-8"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
      >
        <p
          className="font-sans mb-4"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            opacity: 0.45,
          }}
        >
          {product.categories.length} kategorier · {product.cards.length} kort
        </p>

        <div className="space-y-3">
          {product.categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
              onClick={() => {
                navigate(`/category/${cat.id}`);
              }}
              className="rounded-xl px-5 py-4 cursor-pointer active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: 'var(--tile-bg)',
                boxShadow: `0 1px 2px 0 hsla(0,0%,0%,0.04), 0 4px 16px -4px hsla(0,0%,0%,0.08), 0 12px 40px -8px hsla(0,0%,0%,0.06)`,
                borderRadius: 'var(--radius-tile, 10px)',
              }}
            >
              <p
                className="font-sans"
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-text)',
                  opacity: 0.8,
                  marginBottom: '4px',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              <h2
                className="font-serif"
                style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}
              >
                {cat.title}
              </h2>
              {cat.subtitle && (
                <p
                  className="font-serif"
                  style={{ fontSize: '13px', color: 'var(--color-text-secondary)', opacity: 0.7, lineHeight: 1.5 }}
                >
                  {cat.subtitle}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sign-off */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-center pb-16"
      >
        <p
          className="font-serif"
          style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--accent-text)', opacity: 0.4 }}
        >
          {product.tagline}
        </p>
      </motion.div>
    </div>
  );
}
