# iOS Design Token Migration Examples

## Core UI Component Migrations

### 1. Button Component (`components/ui/button.tsx`)

**Before:**
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
)
```

**After:**
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-ios-button text-ios-subheadline font-sf-pro font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spring-green/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-spring-green text-midnight-forest hover:bg-spring-green/90 shadow-ios-subtle hover:shadow-ios-normal",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-ios-button px-3 text-ios-caption-1",
        lg: "h-11 rounded-ios-button px-8 text-ios-headline",
      },
    },
  }
)
```

### 2. Badge Component (`components/ui/badge.tsx`)

**Before:**
```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
      },
    },
  },
);
```

**After:**
```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-ios-full border px-3 py-1 text-ios-caption-1 font-sf-pro-rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-spring-green text-midnight-forest shadow-ios-subtle hover:bg-spring-green/80",
        secondary: "border-transparent bg-moss-green text-white shadow-ios-subtle hover:bg-moss-green/80",
        outline: "border-spring-green text-spring-green hover:bg-spring-green/10",
      },
    },
  },
);
```

### 3. Input Component (`components/ui/input.tsx`)

**Before:**
```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    />
  )
}
```

**After:**
```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-ios-lg border border-sand-gray/30 bg-white px-4 py-3 text-ios-body font-sf-pro shadow-ios-subtle transition-all outline-none file:border-0 file:bg-transparent file:text-ios-caption-1 file:font-sf-pro file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-spring-green focus:ring-2 focus:ring-spring-green/30 focus:shadow-ios-normal",
        "placeholder:text-midnight-forest/50",
        className
      )}
      {...props}
    />
  )
}
```

## Business Logic Component Migrations

### 4. Partner Analytics (`components/partners/PartnerAnalytics.tsx`)

**Before:**
```tsx
<div className="text-2xl font-bold text-green-600">{totalApplications}</div>
```

**After:**
```tsx
<div className="text-ios-title-2 font-sf-pro font-semibold text-spring-green">{totalApplications}</div>
```

### 5. Partner Dashboard Cards (`components/partners/PartnerDashboardOverview.tsx`)

**Before:**
```tsx
<div className={`p-3 rounded-lg ${card.bgColor}`}>
  <p className="text-2xl font-bold">{card.value}</p>
</div>
```

**After:**
```tsx
<div className={`p-4 rounded-ios-xl shadow-ios-subtle ${card.bgColor}`}>
  <p className="text-ios-title-2 font-sf-pro font-semibold">{card.value}</p>
</div>
```

### 6. Climate Dashboard Headers (`components/dashboards/ClimateMetricsDashboard.tsx`)

**Before:**
```tsx
<h2 className="text-xl sm:text-2xl font-medium font-helvetica">Climate Metrics Dashboard</h2>
<h3 className="text-lg font-medium">Greenhouse Gas Emissions</h3>
<span className="text-2xl font-bold">{value}</span>
```

**After:**
```tsx
<h2 className="text-ios-title-2 md:text-ios-title-1 font-sf-pro font-semibold">Climate Metrics Dashboard</h2>
<h3 className="text-ios-headline font-sf-pro font-medium">Greenhouse Gas Emissions</h3>
<span className="text-ios-title-2 font-sf-pro font-bold">{value}</span>
```

## Admin Interface Migrations

### 7. Admin Table Styling (`components/admin/PartnersTable.tsx`)

**Before:**
```tsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
<h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
```

**After:**
```tsx
className="w-full px-4 py-3 border border-sand-gray/30 rounded-ios-lg font-sf-pro focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green transition-all"
<h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-4">No partners found</h3>
```

### 8. Settings Form (`components/admin/SettingsForm.tsx`)

**Before:**
```tsx
<h2 className="text-xl font-helvetica font-medium text-midnight-forest">System Settings</h2>
<h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">General Settings</h3>
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

**After:**
```tsx
<h2 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest">System Settings</h2>
<h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-4">General Settings</h3>
className="w-full px-4 py-3 border border-sand-gray/30 rounded-ios-lg font-sf-pro focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green transition-all"
```

## Page-Level Migrations

### 9. Admin Page Headers (`app/admin/jobs/page.tsx`)

**Before:**
```tsx
<h1 className="text-3xl font-helvetica font-medium text-midnight-forest">Job Listings Management</h1>
<p className="text-2xl font-helvetica font-medium text-midnight-forest">{stats.total}</p>
<h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">Recent Activity</h3>
```

**After:**
```tsx
<h1 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest">Job Listings Management</h1>
<p className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest">{stats.total}</p>
<h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-4">Recent Activity</h3>
```

## Search Interface Migration

### 10. Knowledge Search (`components/search/knowledge-search.tsx`)

**Before:**
```tsx
<h2 className="text-xl font-semibold">{result.title}</h2>
<span className="text-2xl">{getResultTypeIcon(result.result_type)}</span>
<h3 className="text-xl font-semibold">{result.title}</h3>
<div className="card bg-base-100 shadow-lg">
```

**After:**
```tsx
<h2 className="text-ios-title-3 font-sf-pro font-semibold">{result.title}</h2>
<span className="text-ios-title-2">{getResultTypeIcon(result.result_type)}</span>
<h3 className="text-ios-title-3 font-sf-pro font-semibold">{result.title}</h3>
<div className="card bg-white rounded-ios-xl shadow-ios-prominent">
```

## Global Pattern Replacements

### Most Common Migrations Needed:

1. **Typography Scale:**
   - `text-3xl` → `text-ios-title-1 font-sf-pro`
   - `text-2xl` → `text-ios-title-2 font-sf-pro`  
   - `text-xl` → `text-ios-title-3 font-sf-pro`
   - `text-lg` → `text-ios-headline font-sf-pro`

2. **Border Radius:**
   - `rounded-md` → `rounded-ios-lg`
   - `rounded-lg` → `rounded-ios-xl`
   - `rounded-xl` → `rounded-ios-2xl`

3. **Shadows:**
   - `shadow-sm` → `shadow-ios-subtle`
   - `shadow-md` → `shadow-ios-normal` 
   - `shadow-lg` → `shadow-ios-prominent`

4. **Focus States:**
   - `focus:ring-blue-500` → `focus:ring-spring-green/50`
   - `focus:ring-2 focus:ring-ring` → `focus:ring-2 focus:ring-spring-green/50`

5. **Colors:**
   - `text-gray-900` → `text-midnight-forest`
   - `border-gray-300` → `border-sand-gray/30`
   - `bg-blue-50` → `bg-spring-green/10` 