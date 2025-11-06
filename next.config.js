/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['votre-projet.supabase.co'],
  },
}

module.exports = nextConfig
