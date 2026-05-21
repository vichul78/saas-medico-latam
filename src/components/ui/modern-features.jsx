import React from 'react';
import { Activity, Shield, Zap, FolderKanban } from 'lucide-react';

export const ModernFeatures = () => {
  return (
    <section className="w-full bg-black py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Arquitectura clínica de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-600">
              próxima generación.
            </span>
          </h2>
          <p className="text-zinc-400 max-w-2xl text-lg">
            Potencia tu flujo de trabajo con inteligencia artificial, gestión documental avanzada y herramientas diseñadas para escalar sin fricción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 group relative p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <Activity className="w-12 h-12 text-violet-500 mb-8" />
              <h3 className="text-3xl font-semibold text-white mb-4">Visor DICOM Nativo</h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                Visualización de estudios radiológicos en tiempo real con latencia cero. Manipula contraste, zoom y mediciones directamente desde el navegador con rendimiento de escritorio.
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="relative z-10">
               <Zap className="w-10 h-10 text-purple-400 mb-6" />
               <h3 className="text-xl font-semibold text-white mb-3">Redes Neuronales</h3>
               <p className="text-zinc-400">
                 Inteligencia artificial asistente que analiza historiales clínicos y prioriza tus tareas diarias.
               </p>
             </div>
          </div>

           <div className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 transition-all duration-500 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="relative z-10">
               <Shield className="w-10 h-10 text-violet-400 mb-6" />
               <h3 className="text-xl font-semibold text-white mb-3">Seguridad Total</h3>
               <p className="text-zinc-400">
                 Infraestructura protegida con políticas de seguridad estrictas.
               </p>
             </div>
          </div>

          <div className="md:col-span-2 group relative p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <FolderKanban className="w-12 h-12 text-purple-500 mb-8" />
                <h3 className="text-3xl font-semibold text-white mb-4">Gestión Documental</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
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
