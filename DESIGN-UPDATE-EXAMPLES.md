# Design System Update Examples

Here are specific changes you can make to your existing `VisionStartFlow.tsx` to apply the new RemodelAI + RenovateAI design patterns.

## **1. Button Updates**

### **Current (likely):**
```jsx
<Button variant="primary" onClick={handleSubmit}>
  Continue
</Button>
```

### **New Design System:**
```jsx
<button 
  className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-pill hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
  onClick={handleSubmit}
>
  Continue
</button>
```

### **With Icon:**
```jsx
<button 
  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-light text-white font-semibold rounded-pill hover:from-primary-600 hover:to-primary-500 transition-all duration-200 flex items-center justify-center"
  onClick={handleSubmit}
>
  <Sparkles className="h-5 w-5 mr-2" />
  Generate AI Designs
</button>
```

## **2. Card/Container Updates**

### **Current (likely using Card component):**
```jsx
<Card className="p-6">
  {/* Content */}
</Card>
```

### **New Design System:**
```jsx
<div className="bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200">
  {/* Content */}
</div>
```

### **With Border Accent:**
```jsx
<div className="bg-white rounded-card p-6 border-2 border-blue-100">
  {/* Content with blue border accent */}
</div>
```

## **3. Progress Indicator**

### **New Addition (RemodelAI style):**
```jsx
<div className="flex items-center justify-center space-x-4 mb-8">
  {['Upload', 'Details', 'Results'].map((label, index) => {
    const isActive = index <= currentStepIndex;
    return (
      <div key={label} className="flex items-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-pill transition-colors ${
          isActive 
            ? 'bg-primary-500 text-white' 
            : 'bg-bg-gray-100 text-text-light'
        }`}>
          {isActive ? <CheckCircle className="h-5 w-5" /> : index + 1}
        </div>
        <span className={`ml-2 font-medium ${
          isActive ? 'text-text-dark' : 'text-text-light'
        }`}>
          {label}
        </span>
        {index < 2 && (
          <div className={`w-12 h-1 mx-4 ${
            isActive ? 'bg-primary-500' : 'bg-bg-gray-200'
          }`} />
        )}
      </div>
    );
  })}
</div>
```

## **4. Cost Estimation Section (RenovateAI feature)**

### **New Addition:**
```jsx
{/* Add this near the upload section */}
<div className="bg-white rounded-card p-6 border-2 border-blue-100 mt-6">
  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
    <DollarSign className="h-5 w-5 text-accent-green mr-2" />
    Example Cost Breakdown
  </h3>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-text-medium">Materials</span>
      <span className="font-semibold">$2,500 - $3,800</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-text-medium">Labor</span>
      <span className="font-semibold">$1,800 - $2,500</span>
    </div>
    <div className="border-t pt-3 mt-3">
      <div className="flex justify-between items-center font-semibold text-lg">
        <span>Estimated Total</span>
        <span className="text-primary-500">$4,300 - $6,300</span>
      </div>
    </div>
  </div>
</div>
```

## **5. Typography Updates**

### **Headings:**
```jsx
{/* Before */}
<h1 className="text-3xl font-bold text-gray-900">

{/* After */}
<h1 className="text-4xl font-heading font-bold text-text-dark">
```

### **Body Text:**
```jsx
{/* Before */}
<p className="text-gray-600">

{/* After */}
<p className="text-text-medium">
```

## **6. Complete Section Example**

### **Before:**
```jsx
<div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">
    Upload Your Photo
  </h2>
  <p className="text-gray-600 mb-6">
    Upload a photo of your space to get started.
  </p>
  <Button variant="primary">
    Upload Photo
  </Button>
</div>
```

### **After (with new design system):**
```jsx
<div className="max-w-content mx-auto">
  <div className="bg-white rounded-card p-8 shadow-card hover:shadow-card-hover transition-shadow">
    <div className="text-center mb-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500 flex items-center justify-center">
        <Upload className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-heading font-semibold text-text-dark mb-4">
        Upload Your Photo
      </h2>
      <p className="text-text-medium">
        Upload a clear photo of your space. Better photos = better results!
      </p>
    </div>
    
    {/* Upload area */}
    <div className="border-2 border-dashed border-gray-300 rounded-card p-12 text-center hover:border-primary-400 transition-colors cursor-pointer">
      {/* Upload logic here */}
    </div>
    
    <button className="mt-8 w-full py-3 bg-primary-500 text-white font-semibold rounded-pill hover:bg-primary-600 transition-colors">
      Continue to Details
    </button>
  </div>
</div>
```

## **7. Loading State Improvements**

### **New Design System Loading:**
```jsx
{step === 'loading' && (
  <div className="bg-white rounded-card p-12 text-center">
    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary-500/10 flex items-center justify-center animate-pulse">
      <Sparkles className="h-12 w-12 text-primary-500" />
    </div>
    
    <h2 className="text-2xl font-heading font-semibold text-text-dark mb-4">
      Creating Your Vision
    </h2>
    
    <p className="text-text-medium mb-8">
      Our AI is analyzing your space and generating design concepts.
    </p>
    
    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
      <div className="bg-primary-500 h-2 rounded-full animate-progress"></div>
    </div>
  </div>
)}
```

## **8. CSS Animation Addition**

Add this to your component or global CSS:
```css
@keyframes progress {
  0% { width: 0%; }
  100% { width: 100%; }
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
}
```

## **🎯 Implementation Priority**

### **Phase 1 (Quick Wins - 30 minutes):**
1. Update button styles with `rounded-pill` and `primary-500` colors
2. Update card containers with `rounded-card` and `shadow-card`
3. Add progress indicator at the top

### **Phase 2 (Core Features - 1 hour):**
1. Add cost estimation example section
2. Improve loading states with animations
3. Update typography to use new font classes

### **Phase 3 (Polish - 1 hour):**
1. Add smooth transitions to all interactive elements
2. Implement hover effects on cards and buttons
3. Add trust indicators and social proof

## **📁 Files to Reference**

1. **Simple example**: `components/vision/VisionStartFlowSimple.tsx`
2. **Premium example**: `components/vision/VisionStartFlowPremium.tsx`
3. **Design tokens**: `tailwind.config.ts` (colors, fonts, spacing)
4. **Implementation guide**: `REMODELAI-STYLE-GUIDE.md`

## **✅ Verification**

After making changes, check:
- [ ] Buttons have pill shape (100px radius)
- [ ] Cards have consistent rounding (8px)
- [ ] Colors use new palette (`primary-500`, `text-dark`, etc.)
- [ ] Fonts use `font-heading` and `font-body`
- [ ] Transitions are smooth (0.2s)
- [ ] Mobile responsiveness is maintained

The design system is ready to use. Start with Phase 1 changes and you'll immediately see the improvement in your vision flow!