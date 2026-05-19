import { NavLink } from 'react-router-dom';
import { SPECIALTIES, FEATURES, ADDITIONAL } from '@/lib/navigation.js';

/*
  Sidebar de navegación clínica.
  Sigue el ORDEN OBLIGATORIO:
    1. Soluciones por especialidades
    2. Funcionalidades (2.1 Tecnología, 2.2 Gestión, 2.3 Fácil de usar, 2.4 Personalizado)
    3. Adicionales (Productos, Nosotros, Contratar)
*/
export default function Sidebar() {
  return (
    <nav
      aria-label="Módulos del sistema"
      className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-clinical border border-clinical-200 bg-white p-4 shadow-clinical"
    >
      <Section title="1. Soluciones por especialidades">
        {SPECIALTIES.map((s) => (
          <Item key={s.slug} to={`/soluciones/${s.slug}`}>
            {s.label}
          </Item>
        ))}
      </Section>

      <Section title="2.1 Tecnología avanzada">
        {FEATURES.tech.items.map((i) => (
          <Item key={i.slug} to={`/funcionalidades/${FEATURES.tech.base}/${i.slug}`}>
            {i.label}
          </Item>
        ))}
      </Section>

      <Section title="2.2 Gestión integral">
        {FEATURES.management.items.map((i) => (
          <Item key={i.slug} to={`/funcionalidades/${FEATURES.management.base}/${i.slug}`}>
            {i.label}
          </Item>
        ))}
      </Section>

      <Section title="2.3 Fácil de usar">
        {FEATURES.usability.items.map((i) => (
          <Item key={i.slug} to={`/funcionalidades/${FEATURES.usability.base}/${i.slug}`}>
            {i.label}
          </Item>
        ))}
      </Section>

      <Section title="2.4 Personalizado">
        {FEATURES.custom.items.map((i) => (
          <Item key={i.slug} to={`/funcionalidades/${FEATURES.custom.base}/${i.slug}`}>
            {i.label}
          </Item>
        ))}
      </Section>

      <Section title="Adicionales">
        {ADDITIONAL.map((a) => (
          <Item key={a.slug} to={`/${a.slug}`}>
            {a.label}
          </Item>
        ))}
      </Section>
    </nav>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600">
        {title}
      </h3>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function Item({ to, children }) {
  return (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `block rounded-md px-2 py-1.5 text-sm transition ${
            isActive
              ? 'bg-electric-50 font-semibold text-electric-700'
              : 'text-clinical-600 hover:bg-clinical-100 hover:text-electric-700'
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}
