import React from 'react';
import { Activity, Shield, Zap, FolderKanban } from 'lucide-react';

export const ModernFeatures = () => {
  return (
    <section className="w-full bg-[#f5f5f7] py-28 md:py-32 relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-semibold text-gray-950 mb-6 tracking-tight leading-[1.05]">
            Arquitectura clínica de{' '}
            <span className="text-blue-600">próxima generación.</span>
          </h2>
          <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
            Potencia tu flujo de trabajo con inteligencia artificial, gestión documental avanzada y herramientas diseñadas para escalar sin fricción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 group relative p-8 md:p-10 rounded-[2rem] bg-white border border-gray-200/70 hover:border-blue-300 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative z-10">
              <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Activity className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-950 mb-3 tracking-tight">Visor DICOM Nativo</h3>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                Visualización de estudios radiológicos en tiempo real con latencia cero. Manipula contraste, zoom y mediciones directamente desde el navegador con rendimiento de escritorio.
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-[2rem] bg-white border border-gray-200/70 hover:border-blue-300 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-950 mb-3 tracking-tight">Redes Neuronales</h3>
              <p className="text-gray-500">
                Inteligencia artificial asistente que analiza historiales clínicos y prioriza tus tareas diarias.
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-[2rem] bg-white border border-gray-200/70 hover:border-blue-300 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-950 mb-3 tracking-tight">Seguridad Total</h3>
              <p className="text-gray-500">
                Infraestructura protegida con políticas de seguridad estrictas y cumplimiento HIPAA/LGPD.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 group relative p-8 md:p-10 rounded-[2rem] bg-white border border-gray-200/70 hover:border-blue-300 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <FolderKanban className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-3xl font-semibold text-gray-950 mb-3 tracking-tight">Gestión Documental</h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Sistema integral de archivos con búsqueda vectorial. Clasificación automática de resultados de laboratorio y expedientes de pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
