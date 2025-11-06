/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['votre-projet.supabase.co'],
    unoptimized: true
  },
  trailingSlash: true
}

module.exports = nextConfig
