# ACT Component Library - Professional Design Standards

## Overview
The Alliance for Climate Transition (ACT) Component Library adheres to strict professional design standards for enterprise climate economy applications. These guidelines ensure consistency, accessibility, and enterprise-grade user experience across all components.

## Core Design Principles

### 1. No Emoji Policy
**STRICT STANDARD**: The ACT Component Library maintains a complete emoji-free design policy.

#### Rationale:
- **Enterprise Professionalism**: Emojis can appear unprofessional in business applications
- **Cultural Sensitivity**: Emoji interpretation varies across cultures and regions
- **Accessibility**: Screen readers may interpret emojis inconsistently
- **Timelessness**: Text-based design ages better than decorative elements
- **Clarity**: Clean typography provides maximum readability

#### Implementation:
- ✅ Use Lucide React icons for visual elements
- ✅ Use professional typography for all content
- ✅ Use color coding and visual hierarchy for emphasis
- ❌ No emoji characters in buttons, cards, or any UI text
- ❌ No decorative Unicode characters as substitutes

### 2. Typography Standards

#### Font Hierarchy:
- **Primary**: SF Pro Display (iOS-inspired, professional)
- **Secondary**: SF Pro Text (body content)
- **Monospace**: SF Pro Mono (code, data)

#### Size Scale:
- `text-4xl md:text-5xl` - Main headlines
- `text-3xl` - Section headers
- `text-xl` - Subsection headers
- `text-lg` - Body text (large)
- `text-base` - Standard body text
- `text-sm` - Secondary text
- `text-xs` - Captions, metadata

### 3. Icon Standards

#### Approved Icon Library:
- **Primary**: Lucide React (consistent style, professional)
- **Size Standards**: 
  - Small: `w-4 h-4` (16px)
  - Medium: `w-6 h-6` (24px)
  - Large: `w-8 h-8` (32px)
  - Extra Large: `w-12 h-12` (48px)

#### Icon Usage:
- Use semantic icons that clearly represent their function
- Maintain consistent sizing within component groups
- Apply proper color contrast for accessibility
- Position icons logically (leading or trailing text)

### 4. Color System

#### Climate-Focused Palette:
- **Primary**: `spring-green` (#B2DE26) - Main actions, success states
- **Secondary**: `seafoam-blue` (#42C2FF) - Information, secondary actions
- **Accent**: `moss-green` (#394816) - Supporting elements
- **Background**: `midnight-forest` (#001818) - Dark theme base
- **Neutral**: `sand-gray` (#EBE9E1) - Light theme elements

#### Accessibility Requirements:
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- WCAG 2.1 AA compliance mandatory

### 5. Component Standards

#### Button Components:
```typescript
// ✅ Professional button example
<ACTButton variant="primary" size="lg">
  Climate Action
</ACTButton>

// ❌ Avoid emoji decorations
<ACTButton variant="primary" size="lg">
  🌍 Climate Action
</ACTButton>
```

#### Card Components:
```typescript
// ✅ Professional card with icon
<ACTCard
  title="Climate Innovation Hub"
  description="Professional description without decorative elements"
  icon={<div className="w-12 h-12 bg-spring-green rounded-full">
    <div className="w-6 h-6 bg-midnight-forest rounded-full" />
  </div>}
/>
```

#### Banner Components:
```typescript
// ✅ Professional banner
<ACTBanner
  variant="success"
  message="Climate data synchronization completed successfully."
  icon={<CheckCircle className="w-8 h-8" />}
/>
```

### 6. Content Guidelines

#### Writing Style:
- **Professional Tone**: Clear, direct, authoritative
- **Climate Focus**: Industry-specific terminology
- **Concise**: Essential information only
- **Action-Oriented**: Clear calls-to-action

#### Messaging Standards:
- Use specific metrics and data when available
- Avoid marketing language or hype
- Focus on functionality and outcomes
- Maintain technical accuracy

### 7. Accessibility Standards

#### WCAG 2.1 AA Compliance:
- **Color Contrast**: Minimum 4.5:1 ratio
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Descriptive alt text for images

#### Implementation Requirements:
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify keyboard-only navigation
- Validate color contrast ratios
- Ensure proper heading hierarchy

### 8. Technical Implementation

#### Framework Standards:
- **Next.js 14**: App Router, Server Components
- **TypeScript**: Strict mode, full type coverage
- **Tailwind CSS**: Utility-first styling
- **DaisyUI**: Component base layer
- **Framer Motion**: Animation library

#### Performance Requirements:
- **Core Web Vitals**: Green scores on all metrics
- **Bundle Size**: Minimal impact on application size
- **Loading States**: Professional loading indicators
- **Responsive Design**: Mobile-first approach

### 9. Quality Assurance

#### Testing Requirements:
- **Visual Regression**: Automated screenshot testing
- **Accessibility**: WAVE, axe-core validation
- **Performance**: Lighthouse scores 90+
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Device Testing**: iOS, Android, Desktop

#### Code Review Checklist:
- [ ] No emoji characters in code or content
- [ ] Proper TypeScript types
- [ ] Accessibility attributes present
- [ ] Performance optimizations applied
- [ ] Design system compliance
- [ ] Documentation updated

### 10. Enforcement

#### Automated Checks:
- ESLint rules for emoji detection
- TypeScript strict mode enforcement
- Accessibility testing in CI/CD
- Bundle size monitoring
- Performance regression detection

#### Manual Review:
- Design system compliance check
- Content review for professional tone
- Accessibility manual testing
- Cross-browser compatibility verification

## Conclusion

These standards ensure the ACT Component Library maintains the highest level of professionalism suitable for enterprise climate economy applications. All components must adhere to these guidelines without exception.

**Remember**: Clean, professional design is not just aesthetic choice—it's a commitment to accessibility, usability, and enterprise-grade quality.

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: Active Standard 