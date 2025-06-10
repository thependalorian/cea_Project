/**
 * Partner Status Banner Component - iOS Design System
 * Displays partner status information and handles inactive partners
 * Location: components/partners/PartnerStatusBanner.tsx
 */

import { AlertTriangle, Clock, CheckCircle, XCircle, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerStatusBannerProps {
  partner: {
    id: string;
    organization_name: string;
    status?: 'active' | 'inactive' | 'paused' | 'suspended';
    verified?: boolean;
    last_active?: string;
    partnership_level?: string;
  };
  showDetails?: boolean;
  className?: string;
}

export function PartnerStatusBanner({ 
  partner, 
  showDetails = true, 
  className 
}: PartnerStatusBannerProps) {
  const status = partner.status || 'active';
  
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Active Partner',
          description: 'All programs and job listings are available',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'paused':
        return {
          icon: Pause,
          label: 'Programs Paused',
          description: 'Temporarily paused - resume expected soon',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'inactive':
        return {
          icon: Clock,
          label: 'Inactive Partner',
          description: 'No recent activity - some programs may be unavailable',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
      case 'suspended':
        return {
          icon: XCircle,
          label: 'Partnership Suspended',
          description: 'All programs temporarily unavailable',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Status Unknown',
          description: 'Contact support for assistance',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Don't show banner for active verified partners unless explicitly requested
  if (status === 'active' && partner.verified && !showDetails) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-lg border p-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn("font-semibold", config.textColor)}>
              {config.label}
            </h3>
            {!partner.verified && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                Unverified
              </span>
            )}
            {partner.partnership_level === 'premium' && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                Premium Partner
              </span>
            )}
          </div>
          
          <p className={cn("text-sm", config.textColor, "opacity-90")}>
            {config.description}
          </p>
          
          {showDetails && partner.last_active && (
            <p className={cn("text-xs mt-1", config.textColor, "opacity-75")}>
              Last active: {new Date(partner.last_active).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Action buttons for inactive partners */}
      {status !== 'active' && showDetails && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <div className="flex items-center gap-2 text-sm">
            {status === 'paused' && (
              <span className={config.textColor}>
                Check back soon or contact {partner.organization_name} directly
              </span>
            )}
            {status === 'inactive' && (
              <span className={config.textColor}>
                Some programs may still be available - contact partner for updates
              </span>
            )}
            {status === 'suspended' && (
              <span className={config.textColor}>
                Contact our support team for alternative partners
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to check if partner is available for new applications
export function isPartnerAvailable(partner: { status?: string; verified?: boolean }) {
  return partner.status === 'active' && partner.verified;
}

// Utility function to get partner availability message
export function getPartnerAvailabilityMessage(partner: { status?: string; organization_name: string }) {
  const status = partner.status || 'active';
  
  switch (status) {
    case 'active':
      return null;
    case 'paused':
      return `${partner.organization_name} has temporarily paused their programs. Please check back soon or explore other partners.`;
    case 'inactive':
      return `${partner.organization_name} has been inactive recently. Some programs may be unavailable.`;
    case 'suspended':
      return `${partner.organization_name}'s partnership is currently suspended. All programs are temporarily unavailable.`;
    default:
      return `Unable to determine ${partner.organization_name}'s current status. Contact support for assistance.`;
  }
} 