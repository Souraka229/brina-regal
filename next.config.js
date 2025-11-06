/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['votre-projet.supabase.co'],
    unoptimized: true // Important pour certains déploiements
  },
  trailingSlash: true,
  output: 'standalone'
}

module.exports = nextConfig
