# ACT Brand Demo - Alliance for Climate Transition

A comprehensive design system and component library showcasing modern UI components with iOS-inspired design principles, built specifically for the climate economy. **Now featuring live database integration** with real-time CRUD operations using your Climate Economy Assistant Supabase instance.

## 🎨 Design System Overview

### Brand Colors
- **Midnight Forest** (`#001818`) - Primary dark color
- **Spring Green** (`#B2DE26`) - Primary accent color
- **Moss Green** (`#394816`) - Secondary green
- **Seafoam Blue** (`#E0FFFF`) - Light accent
- **Sand Gray** (`#EBE9E1`) - Neutral background

### Typography
- **Headings**: Helvetica Neue for clean, professional appearance
- **Body Text**: Inter for optimal readability
- **UI Elements**: SF Pro for iOS-inspired consistency

## 🧩 Component Library

### Core Components

#### ACTButton
Modern button component with multiple variants:
- **Variants**: primary, secondary, accent, outline, ghost, minimal, glass
- **Sizes**: sm, md, lg, xl
- **Features**: Icons, loading states, full-width options, hover effects

#### ACTCard
Versatile card component with multiple layouts:
- **Variants**: default, outlined, framed, bracketed, gradient, glass, frosted
- **Features**: Titles, descriptions, images, icons, actions, hover effects

#### ACTAvatar
Profile picture component with status indicators:
- **Variants**: circle, rounded, square, squircle
- **Features**: Image support, monogram fallback, status indicators, borders

#### ACTBanner
Notification banner for important messages:
- **Variants**: info, success, warning, error, neutral
- **Features**: Auto-dismiss, actions, custom icons, positioning

#### ACTToast
Toast notification system:
- **Types**: success, error, info, warning
- **Features**: Auto-close, progress indicators, positioning, custom actions

#### ACTFrameElement
Decorative frame components:
- **Variants**: full, open, brackets, corner-brackets, gradient, glass
- **Features**: Elevation, hover effects, animations

#### **NEW: ACTDashboard**
**Live database dashboard with real-time analytics:**
- **Features**: Real-time data from Supabase, interactive statistics, live job listings, partner management, knowledge resources
- **Integration**: Direct connection to Climate Economy Assistant database
- **Analytics**: User stats, partner network, job market, platform activity

### Utility Components
- Typography helpers
- Color utilities
- Animation helpers
- Layout components

## 🗄️ **Live Database Integration**

### **Real-Time Data Features**
- **Dashboard Analytics** - Live statistics from your Climate Economy Assistant platform
- **Job Listings** - Real-time job postings with climate focus areas
- **Partner Network** - Active partner organizations and verification status
- **Knowledge Resources** - Educational content with search and filtering
- **User Analytics** - Platform engagement and conversation metrics

### **Database Services**
- `ProfileService` - User profile management
- `JobSeekerService` - Job seeker operations
- `PartnerService` - Partner organization management
- `JobService` - Job listing operations
- `KnowledgeService` - Educational content management
- `AnalyticsService` - Platform analytics and reporting

### **CRUD Operations**
```typescript
// Example: Fetch live dashboard statistics
const stats = await AnalyticsService.getDashboardStats();

// Example: Search job listings with filters
const jobs = await JobService.searchJobs('renewable energy', {
  location: 'California',
  employment_type: 'full_time',
  climate_focus: ['renewable_energy', 'sustainability']
});

// Example: Get partner information
const partners = await PartnerService.getAllPartners(10);
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install framer-motion lucide-react clsx tailwind-merge @supabase/supabase-js

# Install Tailwind CSS plugins
npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

### Environment Setup

```env
# Supabase Configuration (Required for live data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Usage

```typescript
// Import components
import { ACTButton, ACTCard, ACTAvatar, ACTDashboard } from './components/ui';

// Basic component usage
function MyComponent() {
  return (
    <ACTCard
      title="Climate Action"
      description="Join the movement for sustainable change"
      variant="glass"
      actions={
        <ACTButton variant="primary">
          Get Started
        </ACTButton>
      }
    />
  );
}

// Live dashboard usage
function DashboardPage() {
  return <ACTDashboard />;
}
```

### Tailwind Configuration

Add the ACT brand colors to your `tailwind.config.ts`:

```typescript
import { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        'midnight-forest': '#001818',
        'spring-green': '#B2DE26',
        'moss-green': '#394816',
        'seafoam-blue': '#E0FFFF',
        'sand-gray': '#EBE9E1',
      },
    },
  },
};
```

## 🎯 Features

### iOS-Inspired Design
- Backdrop blur effects
- Smooth animations with Framer Motion
- Glass morphism styling
- Consistent spacing and typography

### **Live Database Connectivity**
- **Real-time data fetching** from Supabase
- **Advanced search and filtering** capabilities
- **Type-safe database operations** with comprehensive TypeScript support
- **Error resilience** with graceful fallbacks

### Accessibility
- ARIA-compliant components
- Keyboard navigation support
- Screen reader friendly
- High contrast color combinations

### Performance
- Optimized bundle size
- Tree-shakeable components
- Minimal dependencies
- TypeScript support
- **Parallel async operations** for optimal data loading

### Responsive Design
- Mobile-first approach
- Flexible grid systems
- Adaptive typography
- Touch-friendly interactions

## 📱 Component Showcase

### Interactive Demo
The main demo page (`page.tsx`) showcases all components in action:
- Live component examples
- Interactive elements
- Color palette demonstration
- Typography showcase
- Real-time animations
- **Live database dashboard** with real data

### **Database Integration Demo**
- **Switch between "Brand Demo" and "Live Dashboard"** views
- **Real-time statistics** from your Climate Economy Assistant platform
- **Interactive data exploration** with search and filtering
- **Error handling** and loading states demonstration

### Component Variants
Each component offers multiple variants to fit different use cases:
- Default styles for general use
- Glass effects for modern aesthetics
- Gradient options for visual impact
- Minimal styles for clean interfaces

## 🔧 Customization

### Theme Extension
Extend the theme by modifying the CSS custom properties:

```css
:root {
  --color-midnight-forest: #001818;
  --color-spring-green: #B2DE26;
  /* Add your custom colors */
}
```

### Component Styling
Use the `className` prop to add custom styling:

```typescript
<ACTButton 
  className="custom-button-style" 
  variant="primary"
>
  Custom Button
</ACTButton>
```

### Database Integration
Extend the database services for your specific needs:

```typescript
export class CustomService {
  static async getCustomData(): Promise<CustomType[]> {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .your_filters();
    
    if (error) throw error;
    return data || [];
  }
}
```

## 🌱 Sustainability Focus

The ACT brand identity emphasizes environmental consciousness:
- Nature-inspired color palette
- Sustainable design principles
- Climate-focused messaging
- Green technology aesthetics

## 📚 Documentation

### Component Props
Each component is fully typed with TypeScript interfaces:
- Comprehensive prop documentation
- Default value specifications
- Usage examples
- Best practices

### **Database Integration Guide**
- [Complete Database Integration Guide](./DATABASE_INTEGRATION.md)
- Service layer architecture documentation
- CRUD operation examples
- Performance optimization guidelines

### Design Tokens
Consistent design tokens for:
- Colors and gradients
- Typography scales
- Spacing systems
- Border radius values
- Shadow definitions

## 🤝 Contributing

To contribute to the ACT brand system:
1. Follow the established design principles
2. Maintain component consistency
3. Add comprehensive TypeScript types
4. Include accessibility features
5. Test across different devices
6. **Test database integration** with real data

## 📊 **Live Demo Features**

### **Dashboard Analytics**
- Real-time user statistics and growth metrics
- Partner network visualization with verification status
- Job market insights with climate focus areas
- Knowledge base metrics and content difficulty analysis
- Platform activity tracking and engagement data

### **Interactive Data Exploration**
- Search and filter functionality across all data types
- Dynamic content updates without page refresh
- Error handling and loading state demonstrations
- Responsive design optimized for all device sizes

## 📄 License

Built for the Alliance for Climate Transition - showcasing modern design principles for sustainable technology interfaces with live database connectivity.

---

*This component library demonstrates the power of consistent design systems in creating professional, accessible, and visually appealing user interfaces for climate-focused applications, now enhanced with real-time database integration capabilities.* 