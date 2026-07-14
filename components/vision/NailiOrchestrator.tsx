'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject, useProjectActions } from '@/lib/ProjectContext';
import StepNavigator from './StepNavigator';
import ProjectAutoSaver from './ProjectAutoSaver';
import VisionRevealPolished from './VisionRevealPolished';
import MaterialsCartPolished from './MaterialsCartPolished';
import ProjectFateCard from './ProjectFateCard';
import StyleQuizBubbles from './StyleQuizBubbles';
import ClarificationModal from './ClarificationModal';
import { Upload, CheckCircle, Sparkles } from 'lucide-react';

export default function NailiOrchestrator() {
  const { state, goToStep } = useProject();
  const { setUploadedImage, setUserDescription, setUnsavedChanges } = useProjectActions();

  // Set unsaved changes whenever state changes
  useEffect(() => {
    setUnsavedChanges(true);
  }, [state.uploadedImage, state.userDescription, state.selectedVibes, state.clarifications, setUnsavedChanges]);

  // Handle image upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      
      // Validate image
      const img = new Image();
      img.onload = () => {
        const isTooSmall = img.width < 200 || img.height < 200;
        // Simple screenshot detection (look for UI elements)
        const isScreenshot = img.width === img.height || 
                           (img.width === 1125 && img.height === 2436) || // iPhone dimensions
                           (img.width === 1080 && img.height === 1920);   // Common screenshot size
        
        if (isTooSmall) {
          // Show toast in real app
          console.warn('Image is too small for accurate analysis');
        }
        
        if (isScreenshot) {
          // Show toast in real app
          console.warn('Please upload original photo, not a screenshot');
        }
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-card bg-white p-8 shadow-card">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
                  <Upload className="h-10 w-10 text-primary-500" />
                </div>
                <h2 className="text-2xl font-heading font-semibold text-text-dark">
                  Start with a Photo
                </h2>
                <p className="mt-2 text-text-medium">
                  Upload a clear photo of your space. Better photos = better results!
                </p>
              </div>

              <div className="mt-8">
                <div className="rounded-card border-2 border-dashed border-gray-300 p-12 text-center hover:border-primary-400 hover:bg-blue-50/50 smooth-transition">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Upload className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-lg font-semibold text-text-dark">
                    Drag & drop or click to upload
                  </p>
                  <p className="mt-2 text-sm text-text-light">
                    JPG, PNG, or WEBP up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="mt-6"
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <CheckCircle className="h-6 w-6 text-primary-500" />
                    </div>
                    <p className="text-sm font-medium text-text-dark">High-Res Photos</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Sparkles className="h-6 w-6 text-primary-500" />
                    </div>
                    <p className="text-sm font-medium text-text-dark">AI Analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Upload className="h-6 w-6 text-primary-500" />
                    </div>
                    <p className="text-sm font-medium text-text-dark">Free Estimate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return <StyleQuizBubbles />;

      case 'clarify':
        return <ClarificationModal />;

      case 'reveal':
        return (
          <div className="space-y-8">
            <VisionRevealPolished />
            <div className="grid gap-8 lg:grid-cols-2">
              <MaterialsCartPolished />
              <ProjectFateCard />
            </div>
          </div>
        );

      case 'decision':
        return (
          <div className="space-y-8">
            <div className="rounded-card bg-white p-8 shadow-card">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-semibold text-text-dark">
                  What's Your Next Step?
                </h2>
                <p className="mt-2 text-text-medium">
                  Choose how you want to bring your vision to life
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <button
                  onClick={() => goToStep('saved')}
                  className="rounded-card border-2 border-gray-200 bg-white p-6 text-left hover:border-primary-500 hover:bg-blue-50 smooth-transition"
                >
                  <div className="mb-4 text-primary-500">🛠️</div>
                  <h3 className="font-semibold text-text-dark">DIY Route</h3>
                  <p className="mt-2 text-sm text-text-medium">
                    Use the materials list and step-by-step guide to do it yourself.
                  </p>
                </button>

                <button
                  onClick={() => goToStep('saved')}
                  className="rounded-card border-2 border-gray-200 bg-white p-6 text-left hover:border-primary-500 hover:bg-blue-50 smooth-transition"
                >
                  <div className="mb-4 text-primary-500">👷</div>
                  <h3 className="font-semibold text-text-dark">Find a Pro</h3>
                  <p className="mt-2 text-sm text-text-medium">
                    Get matched with vetted contractors in your area.
                  </p>
                </button>

                <button
                  onClick={() => goToStep('saved')}
                  className="rounded-card border-2 border-gray-200 bg-white p-6 text-left hover:border-primary-500 hover:bg-blue-50 smooth-transition"
                >
                  <div className="mb-4 text-primary-500">💭</div>
                  <h3 className="font-semibold text-text-dark">Save for Later</h3>
                  <p className="mt-2 text-sm text-text-medium">
                    Add to your vision board and revisit when ready.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <MaterialsCartPolished />
              <ProjectFateCard />
            </div>
          </div>
        );

      case 'saved':
        return (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-card bg-white p-12 text-center shadow-card">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-text-dark">
                Project Saved!
              </h2>
              <p className="mt-4 text-xl text-text-medium">
                Your vision has been added to your personal vision board.
              </p>
              <div className="mt-8 space-y-4">
                <button className="w-full rounded-card bg-primary-500 py-3 font-semibold text-white hover:bg-primary-600 focus-ring btn-polish">
                  View Vision Board
                </button>
                <button
                  onClick={() => goToStep('upload')}
                  className="w-full rounded-card border border-gray-300 bg-white py-3 font-semibold text-text-dark hover:bg-gray-50 focus-ring btn-polish"
                >
                  Start New Project
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StepNavigator>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="loading-min-height"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </StepNavigator>
      
      <ProjectAutoSaver />
    </>
  );
}