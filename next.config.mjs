/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Transpile Three.js ecosystem for the App Router
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // 2. Turbopack Configuration (Replaces Webpack for Next.js 16)
  turbopack: {
    rules: {
      // Modern way to handle GLSL shaders in Turbopack
      '*.{glsl,vs,fs,vert,frag}': ['raw-loader'],
    },
  },

  // 3. Remove experimental.esmExternals: 'loose' 
  // Next.js 16 handles this automatically now.
  
  // 4. Image optimization (Optional but recommended for 3D textures)
  images: {
    unoptimized: true, 
  },
};

export default nextConfig;