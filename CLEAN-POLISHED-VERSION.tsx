'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, ShieldCheck, DollarSign, Sparkles, ShoppingCart, Copy, Home, Warehouse, Package, ExternalLink, ChevronLeft, Loader2, Hammer, Paintbrush, Ruler, Truck } from 'lucide-react';

// Simple Project Context
const ProjectContext = createContext<any>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    currentStep: 'upload' as 'upload' | 'quiz' | 'clarify' | 'reveal' | 'decision' | 'saved',
    uploadedImage: null as string | null,
    isLoading: false,
  });

  const goToStep = useCallback((step: string) => {
    setState(s => ({ ...s, currentStep: step as any }));
  }, []);

  const goBack = useCallback(() => {
    const steps = ['upload', 'quiz', 'clarify', 'reveal', 'decision', 'saved'];
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  }, [state.currentStep, goToStep]);

  return (
    <ProjectContext.Provider value={{ state, setState, goToStep, goBack }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
}

// Polished Vision Flow Component
export default function PolishedVisionFlow() {
  const { state, goToStep, goBack } = useProject();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [zipCode, setZipCode] = useState('');

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const progressSteps = [
    { label: 'Upload', step: 'upload' },
    { label: 'Style', step: 'quiz' },
    { label: 'Details', step: 'clarify' },
    { label: 'Preview', step: 'reveal' },
    { label: 'Plan', step: 'decision' },
  ];

  const currentStepIndex = progressSteps.findIndex(s => s.step === state.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-4">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Secure & Private • Free Estimate
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Visualize Your Renovation
              <span className="block text-blue-600">With AI-Powered Designs</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload a photo and get professional design concepts with accurate cost estimates.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {progressSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 ${
                    isCompleted || isCurrent
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`ml-2 font-medium transition-colors duration-200 ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < progressSteps.length - 1 && (
                    <div className={`w-12 h-1 mx-4 transition-colors duration-200 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {state.currentStep === 'upload' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Start with a Photo
                </h2>
                
                <p className="text-gray-600">
                  Upload a clear photo of your space. Better photos = better results!
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                   onClick={() => document.getElementById('file-upload')?.click()}>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="Preview" className="max-h-72 w-full object-cover mx-auto rounded-xl mb-6" />
                    <p className="text-sm text-gray-600">Click to replace photo</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      JPG, PNG, or WEBP up to 10MB
                    </p>
                    <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
                      Choose File
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ZIP code
                </label>
                <input
                  type="text"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Used for local pricing estimates
                </p>
              </div>

              <button
                className="w-full mt-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToStep('quiz')}
                disabled={!uploadedFile || !zipCode.trim()}
              >
                Continue to Style Quiz
              </button>
            </div>

            {/* Benefits & Cost Estimation */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                  Know Your Costs Upfront
                </h3>
                <p className="text-gray-600">
                  Get detailed breakdowns of materials, labor, and timeline before you start.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
                  AI-Powered Design Suggestions
                </h3>
                <p className="text-gray-600">
                  See multiple design options tailored to your space, style, and budget.
                </p>
              </div>

              {/* Cost Estimation Card */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  Example Cost Estimate
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Materials</span>
                    <span className="font-semibold">$2,500 - $3,800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Labor</span>
                    <span className="font-semibold">$1,800 - $2,500</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Estimated Total</span>
                      <span className="text-blue-600">$4,300 - $6,300</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Based on average room size. Your actual estimate may vary.
                </p>
              </div>

              {/* Materials Preview */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="h-5 w-5 text-orange-600 mr-2" />
                  Sample Materials
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Paint Brush Set', price: '$14.99', retailer: 'Home Depot' },
                    { name: 'Premium Paint', price: '$49.99', retailer: 'Lowe\'s' },
                    { name: 'Drop Cloth', price: '$12.99', retailer: 'Amazon' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.retailer}</p>
                      </div>
                      <span className="font-semibold">{item.price}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Copy className="h-4 w-4 inline mr-2" />
                  Copy as Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {state.currentStep === 'quiz' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pick Your Style</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Modern', 'Minimalist', 'Cozy', 'Industrial', 'Scandinavian', 'Bohemian'].map((style) => (
                <button
                  key={style}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  onClick={() => goToStep('clarify')}
                >
                  <div className="text-2xl mb-2">🎨</div>
                  <p className="font-semibold text-gray-900">{style}</p>
                </button>
              ))}
            </div>
            <button
              className="w-full mt-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
              onClick={() => goToStep('clarify')}
            >
              Continue
            </button>
          </div>
        )}

        {state.currentStep === 'decision' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Vision is Ready!</h2>
              <p className="text-gray-600">Choose how you want to bring it to life</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <button className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="text-3xl mb-4">🛠️</div>
                <h3 className="font-bold text-gray-900 mb-2">DIY Route</h3>
                <p className="text-sm text-gray-600">Use our materials list and guide</p>
              </button>

              <button className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="text-3xl mb-4">👷</div>
                <h3 className="font-bold text-gray-900 mb-2">Find a Pro</h3>
                <p className="text-sm text-gray-600">Get matched with contractors</p>
              </button>

              <button className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center">
                <div className="text-3xl mb-4">💾</div>
                <h3 className="font-bold text-gray-900 mb-2">Save for Later</h3>
                <p className="text-sm text-gray-600">Add to your vision board</p>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t">
              <button
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                onClick={() => goToStep('saved')}
              >
                Save Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      {state.currentStep !== 'upload' && state.currentStep !== 'saved' && (
        <button
          onClick={goBack}
          className="fixed left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}
    </div>
  );
}