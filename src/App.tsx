import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Layout, 
  Type, 
  Globe, 
  Loader2, 
  Sparkles, 
  Maximize2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AdContent {
  headline: string;
  subheadline: string;
  cta: string;
  imagePrompt: string;
}

const ASPECT_RATIOS = [
  '1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'
];

const IMAGE_SIZES = ['1K', '2K', '4K'];

const BANNER_SIZES = [
  { name: 'Medium Rectangle', width: 300, height: 250 },
  { name: 'Leaderboard', width: 728, height: 90 },
  { name: 'Large Mobile Banner', width: 320, height: 100 },
  { name: 'Wide Skyscraper', width: 160, height: 600 },
  { name: 'Half Page', width: 300, height: 600 },
  { name: 'Billboard', width: 970, height: 250 },
];

export default function App() {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'copy' | 'image'>('idle');
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setAdContent(null);
    setImageUrl(null);
    
    try {
      // Step 1: Generate copy
      setStep('copy');
      const copyRes = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, url }),
      });
      
      if (!copyRes.ok) throw new Error('Failed to generate ad content');
      const content = await copyRes.json();
      setAdContent(content);

      // Step 2: Generate image
      // Note: In AI Studio, we should ensure the user has acknowledged the paid model.
      // We assume the system handles the UI trigger if we call the tool, 
      // but from the client code we just call our backend.
      setStep('image');
      const imageRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: content.imagePrompt, 
          aspectRatio, 
          imageSize 
        }),
      });
      
      if (!imageRes.ok) {
        const errData = await imageRes.json();
        throw new Error(errData.error || 'Failed to generate image');
      }
      const imageData = await imageRes.json();
      setImageUrl(imageData.imageUrl);
      
      setStep('idle');
    } catch (err: any) {
      setError(err.message);
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <header className="border-b border-neutral-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              BannerGen Pro
            </span>
          </div>
          <div className="text-sm text-neutral-500 flex items-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Professional Grade</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Multi-Size</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-500" />
                Product Details
              </h2>
              <form onSubmit={generateBanners} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., A sleek ergonomic chair for professional gamers with lumbar support and breathable mesh."
                    className="w-full h-32 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">Product URL (Optional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/product"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-3 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                    >
                      {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Quality</label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full px-3 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
                    >
                      {IMAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-xl font-bold text-white shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {step === 'copy' ? 'Generating Ad Copy...' : 'Generating 4K Image...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Banner Suite
                    </>
                  )}
                </button>
              </form>
            </section>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Output Display */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isLoading || imageUrl ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-12"
                >
                  {/* Main Preview */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="aspect-video bg-neutral-800 relative group">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt="Generated product visual" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 gap-4">
                          <div className="relative">
                            <ImageIcon className="w-16 h-16 opacity-20" />
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                            />
                          </div>
                          <p className="text-sm font-medium animate-pulse">Processing your creative assets...</p>
                        </div>
                      )}
                      
                      {/* Overlay Copy Preview */}
                      {adContent && imageUrl && (
                        <div className="absolute inset-0 flex flex-col justify-center px-12 bg-black/40 backdrop-blur-[2px] transition-all group-hover:bg-black/20">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-md space-y-4"
                          >
                            <h3 className="text-4xl md:text-5xl font-black leading-tight drop-shadow-2xl text-white uppercase tracking-tighter">
                              {adContent.headline}
                            </h3>
                            <p className="text-lg text-neutral-100 drop-shadow-md font-medium">
                              {adContent.subheadline}
                            </p>
                            <div className="pt-4 flex items-center gap-4">
                              <span className="px-8 py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:bg-neutral-200 transition-colors cursor-pointer">
                                {adContent.cta}
                              </span>
                              <a 
                                href={imageUrl} 
                                download="banner_creative.png"
                                className="p-3 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-semibold border border-white/10"
                              >
                                <ImageIcon className="w-4 h-4" />
                                Download 4K
                              </a>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Suite */}
                  {imageUrl && adContent && (
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                          <Maximize2 className="w-6 h-6 text-indigo-500" />
                          Banner Suite
                        </h2>
                        <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                          {BANNER_SIZES.length} Standard Formats
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {BANNER_SIZES.map((size, idx) => (
                          <motion.div
                            key={size.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-bold text-neutral-400">{size.name}</span>
                              <span className="text-[10px] font-mono text-neutral-600">{size.width}x{size.height}</span>
                            </div>
                            <div 
                              className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-lg group-hover:border-indigo-500/50 transition-colors relative"
                              style={{ 
                                width: '100%', 
                                maxWidth: size.width, 
                                height: size.height,
                                margin: size.width > 500 ? '0 auto' : '0'
                              }}
                            >
                              <img 
                                src={imageUrl} 
                                alt={size.name} 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4 py-2 pointer-events-none">
                                <h4 
                                  className="font-bold leading-tight line-clamp-2"
                                  style={{ fontSize: Math.max(14, size.height / 10) }}
                                >
                                  {adContent.headline}
                                </h4>
                                {size.height > 150 && (
                                  <p className="text-[10px] mt-1 text-neutral-200 line-clamp-2 opacity-80">
                                    {adContent.subheadline}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <span className="inline-block px-3 py-1 bg-white text-black font-bold rounded text-[8px] uppercase tracking-wider">
                                    {adContent.cta}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}
                </motion.div>
              ) : (
                <div className="h-[600px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-neutral-800 rounded-3xl">
                  <div className="w-20 h-20 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
                    <Layout className="w-10 h-10 text-neutral-700" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">No Creatives Yet</h2>
                  <p className="text-neutral-500 max-w-sm mb-8 leading-relaxed">
                    Fill in your product details on the left to generate a professional banner suite with AI-powered visuals and copy.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-1 bg-indigo-500/20 rounded-full" />
                      <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Step 1: Input</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-1 bg-neutral-800 rounded-full" />
                      <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Step 2: Magic</span>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">BannerGen Pro</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">API Status</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <p className="text-xs text-neutral-600">
            Powered by Gemini 3 Pro Image & 3.8 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
