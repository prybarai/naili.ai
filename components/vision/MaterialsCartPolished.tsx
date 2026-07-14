'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Copy, Check, ExternalLink, Home, Warehouse, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProject } from '@/lib/ProjectContext';

interface MaterialsCartPolishedProps {
  className?: string;
}

export default function MaterialsCartPolished({ className }: MaterialsCartPolishedProps) {
  const { state } = useProject();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const materials = state.materialsList || [
    { name: 'Paint Brush Set', price: 14.99, link: 'https://www.homedepot.com/p/...', quantity: 1, retailer: 'home_depot' },
    { name: 'Premium Paint (Gallon)', price: 49.99, link: 'https://www.lowes.com/p/...', quantity: 2, retailer: 'lowes' },
    { name: 'Drop Cloth', price: 12.99, link: 'https://www.amazon.com/...', quantity: 1, retailer: 'amazon' },
    { name: "Painter's Tape", price: 8.99, link: 'https://www.homedepot.com/p/...', quantity: 2, retailer: 'home_depot' },
    { name: 'Paint Roller Kit', price: 24.99, link: 'https://www.lowes.com/p/...', quantity: 1, retailer: 'lowes' },
    { name: 'Paint Tray', price: 6.99, link: 'https://www.amazon.com/...', quantity: 2, retailer: 'amazon' },
  ];

  const totalCost = materials.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get retailer icon and color
  const getRetailerInfo = (retailer: string) => {
    switch (retailer) {
      case 'home_depot':
        return { icon: <Home className="h-4 w-4" />, color: 'text-orange-600', bg: 'bg-orange-50', name: 'Home Depot' };
      case 'lowes':
        return { icon: <Warehouse className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50', name: 'Lowe\'s' };
      case 'amazon':
        return { icon: <Package className="h-4 w-4" />, color: 'text-amber-600', bg: 'bg-amber-50', name: 'Amazon' };
      default:
        return { icon: <ShoppingCart className="h-4 w-4" />, color: 'text-gray-600', bg: 'bg-gray-50', name: 'Retailer' };
    }
  };

  // Copy materials as checklist
  const copyChecklist = async () => {
    const checklist = materials.map(item => `[ ] ${item.name} - $${item.price.toFixed(2)} x${item.quantity}`).join('\n');
    const totalLine = `\nTotal: $${totalCost.toFixed(2)}`;
    
    try {
      await navigator.clipboard.writeText(checklist + totalLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Visible materials (show all if expanded, otherwise first 3)
  const visibleMaterials = expanded ? materials : materials.slice(0, 3);

  return (
    <div className={cn('rounded-card bg-white p-6 shadow-card hover:shadow-card-hover smooth-transition', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary-500/10 p-2">
            <ShoppingCart className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-text-dark">Materials Cart</h3>
            <p className="text-sm text-text-medium">Everything you need for your project</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-primary-500">
            ${totalCost.toFixed(2)}
          </div>
          <div className="text-sm text-text-light">Estimated total</div>
        </div>
      </div>

      {/* Materials list */}
      <div className="space-y-3">
        {visibleMaterials.map((item, index) => {
          const retailer = getRetailerInfo(item.retailer);
          const itemTotal = item.price * item.quantity;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between rounded-card border border-gray-200 p-4 hover:bg-gray-50 smooth-transition"
            >
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', retailer.bg)}>
                  <div className={retailer.color}>{retailer.icon}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-text-dark">{item.name}</h4>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', retailer.bg, retailer.color)}>
                      {retailer.name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-text-medium">
                    <span>${item.price.toFixed(2)} each</span>
                    <span>× {item.quantity}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold tabular-nums text-text-dark">
                    ${itemTotal.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-light">Total</div>
                </div>
                
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-card border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500 focus-ring btn-polish"
                  aria-label={`Buy ${item.name} from ${retailer.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {materials.length > 3 && (
        <button
          onClick={toggleExpanded}
          className="mt-4 w-full rounded-card border border-gray-300 bg-gray-50 py-2 text-sm font-medium text-text-medium hover:bg-gray-100 focus-ring"
        >
          {expanded ? 'Show Less' : `Show ${materials.length - 3} More Items`}
        </button>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={copyChecklist}
          className="flex flex-1 items-center justify-center gap-2 rounded-card border border-gray-300 bg-white py-3 font-medium text-text-medium hover:bg-gray-50 focus-ring btn-polish"
        >
          {copied ? (
            <>
              <Check className="h-5 w-5 text-accent-green" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              Copy as Checklist
            </>
          )}
        </button>
        
        <button className="flex flex-1 items-center justify-center gap-2 rounded-card bg-primary-500 py-3 font-medium text-white hover:bg-primary-600 focus-ring btn-polish">
          <ShoppingCart className="h-5 w-5" />
          Add All to Cart
        </button>
      </div>

      {/* Footer note */}
      <div className="mt-6 rounded-card bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white p-1.5">
            <Package className="h-4 w-4 text-primary-500" />
          </div>
          <div>
            <h4 className="font-medium text-text-dark">Smart shopping tips</h4>
            <ul className="mt-2 space-y-1 text-sm text-text-medium">
              <li>• Click retailer links to open in new tabs for easy comparison</li>
              <li>• Use the checklist for in-store shopping</li>
              <li>• Prices are estimates based on current market rates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Affiliate disclosure */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-light">
          Some links are affiliate links. Naili may earn a commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}