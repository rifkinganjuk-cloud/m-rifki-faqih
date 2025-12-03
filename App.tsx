import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Zap, 
  Copy, 
  Check, 
  Clapperboard,
  Wand2,
  AlertCircle
} from 'lucide-react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Select } from './components/Select';
import { 
  AppTab, 
  GeneratorInputs, 
  AnalysisResult, 
  LoadingState, 
  ImageEditInputs,
  VideoGenInputs
} from './types';
import { 
  RATIO_OPTIONS, 
  VISUAL_STYLE_OPTIONS, 
  TONE_OPTIONS 
} from './constants';
import { 
  generateAffiliateContent, 
  editImage, 
  animateImage 
} from './services/geminiService';

const App = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);

  // Generator State
  const [genInputs, setGenInputs] = useState<GeneratorInputs>({
    productLink: '',
    ratio: '9:16',
    visualStyle: 'Hyper-Realistic',
    tone: 'Soft Sell'
  });
  const [genStatus, setGenStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [genResult, setGenResult] = useState<AnalysisResult | null>(null);

  // Image Edit State
  const [editInputs, setEditInputs] = useState<ImageEditInputs>({ image: null, prompt: '' });
  const [editStatus, setEditStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  // Video Animation State
  const [videoInputs, setVideoInputs] = useState<VideoGenInputs>({ image: null, prompt: '' });
  const [videoStatus, setVideoStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // UI Helper States
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Handlers - Generator
  const handleGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genInputs.productLink) return;
    setGenStatus(LoadingState.LOADING);
    setGenResult(null);
    try {
      const result = await generateAffiliateContent(genInputs);
      setGenResult(result);
      setGenStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setGenStatus(LoadingState.ERROR);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Handlers - Image Editor
  const handleImageEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInputs.image) return;
    setEditStatus(LoadingState.LOADING);
    setEditedImage(null);
    try {
      const result = await editImage(editInputs.image, editInputs.prompt);
      setEditedImage(result);
      setEditStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setEditStatus(LoadingState.ERROR);
    }
  };

  // Handlers - Video Animator
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError(null);
    
    // Check for API key logic for Veo
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setVideoError("API_KEY_MISSING");
        return;
      }
    }

    if (!videoInputs.image) return;
    setVideoStatus(LoadingState.LOADING);
    setGeneratedVideo(null);
    try {
      const result = await animateImage(videoInputs.image, videoInputs.prompt);
      setGeneratedVideo(result);
      setVideoStatus(LoadingState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setVideoStatus(LoadingState.ERROR);
      if (error.message === "API_KEY_MISSING") {
        setVideoError("API_KEY_MISSING");
      }
    }
  };

  const openKeySelection = async () => {
    const win = window as any;
    if (win.aistudio?.openSelectKey) {
        try {
            await win.aistudio.openSelectKey();
            setVideoError(null); // Clear error and let user try again
        } catch (e) {
            console.error("Failed to open key selection", e);
        }
    }
  };

  // Renderers
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Affiliate PRO</h1>
              <p className="text-xs text-indigo-400 font-medium">MAX VERSION 3.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab(AppTab.GENERATOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === AppTab.GENERATOR 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Content Generator</span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.IMAGE_EDITOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === AppTab.IMAGE_EDITOR 
                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">Image Editor</span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.VIDEO_ANIMATOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === AppTab.VIDEO_ANIMATOR 
                ? 'bg-pink-600/10 text-pink-400 border border-pink-600/20' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            <Clapperboard className="w-5 h-5" />
            <span className="font-medium">Video Animator</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
           <div className="text-xs text-gray-500 text-center">
              Powered by Gemini 2.5 Flash & Veo 3.1
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-8">
        
        {/* --- GENERATOR TAB --- */}
        {activeTab === AppTab.GENERATOR && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Affiliate Content Generator</h2>
              <p className="text-gray-400">Generate 10 viral angles, hooks, scripts, and captions instantly.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
              <form onSubmit={handleGenSubmit} className="space-y-6">
                <Input
                  label="Product Link"
                  placeholder="Paste TikTok Shop / Shopee / Tokopedia link..."
                  value={genInputs.productLink}
                  onChange={(e) => setGenInputs({...genInputs, productLink: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Select
                    label="Video Ratio"
                    options={RATIO_OPTIONS}
                    value={genInputs.ratio}
                    onChange={(e) => setGenInputs({...genInputs, ratio: e.target.value})}
                  />
                  <Select
                    label="Visual Style"
                    options={VISUAL_STYLE_OPTIONS}
                    value={genInputs.visualStyle}
                    onChange={(e) => setGenInputs({...genInputs, visualStyle: e.target.value})}
                  />
                  <Select
                    label="Tone"
                    options={TONE_OPTIONS}
                    value={genInputs.tone}
                    onChange={(e) => setGenInputs({...genInputs, tone: e.target.value})}
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    variant="accent" 
                    className="w-full"
                    isLoading={genStatus === LoadingState.LOADING}
                  >
                    {genStatus === LoadingState.LOADING ? 'Analyzing Product...' : 'Generate 10 Viral Angles'}
                  </Button>
                </div>
              </form>
            </div>

            {genStatus === LoadingState.SUCCESS && genResult && (
              <div className="space-y-8 animate-fade-in">
                {/* Product Analysis Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-indigo-500/30">
                  <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Product Analysis
                  </h3>
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm text-gray-300 font-mono bg-gray-900/50 p-4 rounded-lg">
                    {genResult.generalAnalysis}
                  </div>
                </div>

                {/* Angles Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {genResult.angles.map((angle, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors shadow-lg">
                      <div className="bg-gray-750 border-b border-gray-700 px-6 py-4 flex justify-between items-center bg-gray-800">
                         <h4 className="text-lg font-bold text-white text-indigo-300">Angle {idx + 1}</h4>
                         <button 
                           onClick={() => copyToClipboard(angle.content, idx)}
                           className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                         >
                           {copiedIndex === idx ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                           {copiedIndex === idx ? 'Copied' : 'Copy'}
                         </button>
                      </div>
                      <div className="p-6 bg-gray-800">
                        <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm leading-relaxed">
                          {angle.content.replace(/--- ANGLE \d+ ---/, '').trim()}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- IMAGE EDITOR TAB --- */}
        {activeTab === AppTab.IMAGE_EDITOR && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Magic Image Editor</h2>
              <p className="text-gray-400">Upload an image and use text to transform it (e.g. "Add a retro filter", "Remove background").</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-6 h-fit">
                <form onSubmit={handleImageEditSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors relative bg-gray-900/50">
                     <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setEditInputs({...editInputs, image: e.target.files?.[0] || null})}
                     />
                     {editInputs.image ? (
                        <div className="flex flex-col items-center">
                           <img 
                            src={URL.createObjectURL(editInputs.image)} 
                            alt="Preview" 
                            className="h-48 object-contain rounded-lg mb-2"
                           />
                           <span className="text-sm text-green-400 font-medium">{editInputs.image.name}</span>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center text-gray-400">
                           <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                           <span className="text-sm font-medium">Click to upload image</span>
                        </div>
                     )}
                  </div>

                  <Input
                    label="Edit Instruction"
                    placeholder="e.g. Add a cyberpunk neon glow..."
                    value={editInputs.prompt}
                    onChange={(e) => setEditInputs({...editInputs, prompt: e.target.value})}
                    required
                  />

                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    isLoading={editStatus === LoadingState.LOADING}
                    disabled={!editInputs.image || !editInputs.prompt}
                  >
                    {editStatus === LoadingState.LOADING ? 'Processing...' : 'Apply Magic Edit'}
                  </Button>
                </form>
              </div>

              {/* Result Area */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                 {editStatus === LoadingState.SUCCESS && editedImage ? (
                    <div className="w-full space-y-4">
                       <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Result</h3>
                       <img src={editedImage} alt="Edited result" className="w-full rounded-lg shadow-2xl border border-gray-600" />
                       <a href={editedImage} download="edited_image.png" className="block w-full">
                          <Button variant="secondary" className="w-full">Download Image</Button>
                       </a>
                    </div>
                 ) : (
                    <div className="text-center text-gray-500">
                       <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                       <p>Edited image will appear here</p>
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIDEO ANIMATOR TAB --- */}
        {activeTab === AppTab.VIDEO_ANIMATOR && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center md:text-left">
               <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white mb-2">Veo Image Animator</h2>
                  <span className="px-2 py-1 text-xs font-bold bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/30 uppercase">Paid Key Required</span>
               </div>
              <p className="text-gray-400">Bring static images to life with Veo 3.1. Requires a paid GCP API Key.</p>
            </div>

            {videoError === "API_KEY_MISSING" && (
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-yellow-500 w-6 h-6" />
                        <div>
                            <h3 className="font-bold text-yellow-100">Paid API Key Required</h3>
                            <p className="text-yellow-200/70 text-sm">To use Veo, you must select a valid API Key from a paid Google Cloud Project.</p>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline hover:text-blue-300">Read Billing Docs</a>
                        </div>
                    </div>
                    <Button onClick={openKeySelection} variant="secondary" className="whitespace-nowrap">
                        Select API Key
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-6 h-fit">
                <form onSubmit={handleVideoSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-pink-500 transition-colors relative bg-gray-900/50">
                     <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setVideoInputs({...videoInputs, image: e.target.files?.[0] || null})}
                     />
                     {videoInputs.image ? (
                        <div className="flex flex-col items-center">
                           <img 
                            src={URL.createObjectURL(videoInputs.image)} 
                            alt="Preview" 
                            className="h-48 object-contain rounded-lg mb-2"
                           />
                           <span className="text-sm text-pink-400 font-medium">{videoInputs.image.name}</span>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center text-gray-400">
                           <Video className="w-12 h-12 mb-2 opacity-50" />
                           <span className="text-sm font-medium">Click to upload image</span>
                        </div>
                     )}
                  </div>

                  <Input
                    label="Animation Prompt (Optional)"
                    placeholder="e.g. Pan camera slowly, cinematic lighting..."
                    value={videoInputs.prompt}
                    onChange={(e) => setVideoInputs({...videoInputs, prompt: e.target.value})}
                  />

                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    isLoading={videoStatus === LoadingState.LOADING}
                    disabled={!videoInputs.image}
                  >
                    {videoStatus === LoadingState.LOADING ? 'Generating Video (may take 1-2 mins)...' : 'Animate with Veo'}
                  </Button>
                </form>
              </div>

              {/* Result Area */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                 {videoStatus === LoadingState.SUCCESS && generatedVideo ? (
                    <div className="w-full space-y-4">
                       <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Generated Video</h3>
                       <video 
                          src={generatedVideo} 
                          controls 
                          autoPlay 
                          loop 
                          className="w-full rounded-lg shadow-2xl border border-gray-600"
                       />
                       <a href={generatedVideo} download="veo_animation.mp4" className="block w-full">
                          <Button variant="secondary" className="w-full">Download Video</Button>
                       </a>
                    </div>
                 ) : (
                    <div className="text-center text-gray-500">
                       <Video className="w-16 h-16 mx-auto mb-4 opacity-20" />
                       <p>Animated video will appear here.</p>
                       {videoStatus === LoadingState.LOADING && (
                           <p className="text-xs text-gray-600 mt-2 animate-pulse">This usually takes about 60-90 seconds.</p>
                       )}
                    </div>
                 )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;