"use client";
import { motion } from "framer-motion";

const images = ["/placeholder1.png", "/placeholder2.png", "/placeholder3.png", "/placeholder4.png"];

export function Gallery() {
  return (
    <section className="container-responsive py-16" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-2xl font-bold mb-6">Aperçu visuel</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
            aria-label={`Mockup ${i + 1}`}
          >
            Mockup {i + 1}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
