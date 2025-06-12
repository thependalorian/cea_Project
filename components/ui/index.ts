// UI Components Index - Streamlined for v1 API
// Rule 22: All UI components in /components folder

// Core ACT UI Components (Essential)
export { ACTButton } from './ACTButton';
export { ACTCard } from './ACTCard';
export { ACTBadge } from './ACTBadge';
export { ACTFrameElement } from './ACTFrameElement';
export { ACTForm } from './ACTForm';

// Chat Components
export { FloatingChatWindow } from './FloatingChatWindow';
export { ChatButton } from './ChatButton';

// Standard UI Components
export { Button } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Input } from './input';
export { Label } from './label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './select';
export { Badge } from './badge';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Checkbox } from './checkbox';
export { Switch } from './switch';
export { Spinner } from './spinner';
export { Toaster } from './toaster';
export { useToast } from './use-toast';
export { SectionHeader } from './section-header';

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

// Tooltip
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

// ACT Brand Components - Alliance for Climate Transition
export { ACTBrandDemo } from './ACTBrandDemo';
export { ACTAvatar } from './ACTAvatar';
export { ACTBanner } from './ACTBanner';
export { ACTDashboard } from './ACTDashboard';
export { ACTToast, ACTToastContainer, useACTToast } from './ACTToast';
export { ACTHeader } from './ACTHeader';
export { ACTFooter } from './ACTFooter';
export { BottomCTA } from './BottomCTA';

// Enhanced Visual Components - Added for maximum viewing impact
export { ACTImagePlaceholder } from './ACTImagePlaceholder';
export { 
  ClimateImpactCard, 
  ClimateHeroCard, 
  ProjectShowcaseCard, 
  FeatureGridCard 
} from './ACTCardVariations';
export { 
  MediaGallery, 
  DashboardOverview, 
  ProjectPortfolio, 
  FeatureShowcase 
} from './ACTVisualShowcase';

export { ImagePlaceholder } from "./ImagePlaceholder";

// ACT Brand Typography Classes (for TypeScript support)
export const ACTBrandClasses = {
  typography: {
    hero: 'text-act-hero font-helvetica font-medium',
    display: 'text-act-display font-helvetica font-medium', 
    title: 'text-act-title font-helvetica font-medium',
    bodyLarge: 'text-act-body-large font-inter',
    body: 'text-act-body font-inter',
    small: 'text-act-small font-inter',
  },
  components: {
    buttonPrimary: 'btn-act-primary',
    buttonSecondary: 'btn-act-secondary', 
    buttonOutline: 'btn-act-outline',
    card: 'card-act',
    cardFramed: 'card-act-framed',
    input: 'input-act',
    frame: 'act-frame',
    frameOpen: 'act-frame-open',
    brackets: 'act-brackets',
  },
  gradients: {
    primary: 'act-gradient-primary',
    secondary: 'act-gradient-secondary',
    accent: 'act-gradient-accent',
  },
  colors: {
    springGreen: 'text-spring-green',
    mossGreen: 'text-moss-green', 
    midnightForest: 'text-midnight-forest',
    seafoamBlue: 'text-seafoam-blue',
    sandGray: 'text-sand-gray',
  },
  layout: {
    section: 'layout-act-section',
    container: 'layout-act-container',
    grid: 'layout-act-grid',
  },
  animations: {
    glow: 'animate-act-glow',
    bounce: 'animate-act-bounce',
    fadeIn: 'animate-act-fade-in',
    slideUp: 'animate-act-slide-up',
  }
} as const; 