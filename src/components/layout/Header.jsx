import { NavLink, Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo.jsx';
import ClinicalAvatar from '@/components/common/ClinicalAvatar.jsx';

/*
  Header con LOGO MUY GRANDE (regla visual obligatoria).
  - El contenedor del logo ocupa una banda alta y prominente.
  - Navegación principal accesible por teclado.
  - Sin tonos verdes en ningún elemento.
*/
export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-clinical-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* CONTENEDOR DEL LOGOTIPO — escalado mucho más grande */}
        <Link
          to="/"
          className="group flex items-center gap-4"
          aria-label="Ir al inicio de MediCo LatAm"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric-gradient p-2 shadow-clinical transition group-hover:scale-[1.02] sm:h-24 sm:w-24">
            <Logo className="h-full w-full" />
          </div>
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-3xl font-bold tracking-tight text-clinical-800">
              MediCo<span className="text-electric-600"> LatAm</span>
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-violet-600">
              Plataforma clínica regional
            </span>
          </div>
        </Link>

        {/* Navegación primaria */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          <HeaderLink to="/soluciones/radiologia">Soluciones</HeaderLink>
          <HeaderLink to="/funcionalidades/tecnologia/ia-asistente">Funcionalidades</HeaderLink>
          <HeaderLink to="/productos">Productos</HeaderLink>
          <HeaderLink to="/nosotros">Nosotros</HeaderLink>
          <Link to="/contratar" className="btn-primary ml-2">
            Contratar
          </Link>
        </nav>

        {/* Perfil clínico */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-clinical-800">Dra. Lucía Marín</p>
            <p className="text-xs text-clinical-500">Radiología · CDMX</p>
          </div>
          <ClinicalAvatar name="Lucía Marín" variant="female" size={40} />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : ''}`
      }
    >
      {children}
    </NavLink>
  );
}
