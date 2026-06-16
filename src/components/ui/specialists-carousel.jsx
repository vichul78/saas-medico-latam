import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Activity, Brain, Heart, Bone, Stethoscope } from "lucide-react";

const specialties = [
  { id: 0, title: "Radiología Avanzada", desc: "Análisis DICOM en la nube con IA.", icon: Activity },
  { id: 1, title: "Neurología Clínica", desc: "Mapeo y seguimiento de pacientes.", icon: Brain },
  { id: 2, title: "Cardiología", desc: "Monitoreo de signos y reportes exactos.", icon: Heart },
  { id: 3, title: "Traumatología", desc: "Gestión de imágenes y cirugías.", icon: Bone },
  { id: 4, title: "Medicina General", desc: "Historias clínicas unificadas.", icon: Stethoscope },
];

export const SpecialistsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(2);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % specialties.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + specialties.length) % specialties.length);

  const getVariant = (index) => {
    const diff = (index - currentIndex + specialties.length) % specialties.length;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -4) return "right";
    if (diff === 4 || diff === -1) return "left";
    return "hidden";
  };

  const variants = {
    center: { x: 0, scale: 1, zIndex: 5, opacity: 1, rotateY: 0 },
    left: { x: "-60%", scale: 0.8, zIndex: 3, opacity: 0.45, rotateY: 15 },
    right: { x: "60%", scale: 0.8, zIndex: 3, opacity: 0.45, rotateY: -15 },
    hidden: { scale: 0.5, zIndex: 1, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <section className="w-full bg-white py-24 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="mb-14 text-center z-10 relative px-6">
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-950 mb-4 tracking-tight">
          Diseñado para cada <span className="text-blue-600">Especialidad</span>
        </h2>
        <p className="text-gray-500 text-lg">Módulos clínicos adaptables a tu área de experticia.</p>
      </div>

      <div className="relative w-full max-w-4xl h-[400px] flex items-center justify-center perspective-[1000px]">
        <AnimatePresence initial={false}>
          {specialties.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={variants}
                initial="hidden"
                animate={getVariant(index)}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-[300px] md:w-[400px] h-[300px] rounded-3xl bg-[#f5f5f7] border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-gray-300/40"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6 border border-blue-100">
                  <Icon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-950 mb-3 tracking-tight">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-5xl flex justify-between px-4 z-20 pointer-events-none">
          <button onClick={prevSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 transition-all shadow-md">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="pointer-events-auto w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-110 transition-all shadow-md">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
