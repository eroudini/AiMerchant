/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Déclare explicitement le root pour Turbopack afin d'éviter la détection auto sur un autre dossier
  turbopack: {
    root: __dirname,
  },
  images: {
    // Migration vers remotePatterns (domains est déprécié)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;