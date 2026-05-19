import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import Sidebar from '@/components/layout/Sidebar.jsx';
import Footer from '@/components/layout/Footer.jsx';
import AICopilot from '@/components/copilot/AICopilot.jsx';

/*
  Layout principal de 3 zonas (regla visual del producto):

  ┌──────────────────────────── Header (logo MUY grande) ─────────────────────────────┐
  │                                                                                   │
  │  ┌─────────────┐  ┌──────────────────────────────────┐  ┌──────────────────────┐  │
  │  │   Sidebar   │  │   Centro: datos / historial      │  │  AI Copilot (right)  │  │
  │  │ (izquierda) │  │   (Outlet de React Router)       │  │  anclado, scroll     │  │
  │  └─────────────┘  └──────────────────────────────────┘  └──────────────────────┘  │
  │                                                                                   │
  └────────────────────────────────── Footer ─────────────────────────────────────────┘

  El centro/izquierda quedan libres para los datos clínicos y el historial.
  El AICopilot está anclado a la derecha como columna fija.
*/
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-clinical-50">
      <Header />

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-12 gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Columna izquierda: navegación */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <Sidebar />
        </aside>

        {/* Columna central: datos / historial */}
        <main className="col-span-12 md:col-span-9 lg:col-span-7">
          <Outlet />
        </main>

        {/* Columna derecha: Copiloto IA anclado */}
        <aside className="col-span-12 lg:col-span-3">
          <AICopilot />
        </aside>
      </div>

      <Footer />
    </div>
  );
}
