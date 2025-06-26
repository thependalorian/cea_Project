/**
 * Resource card component with brand styling
 * Purpose: Display resources following ACT photography and layout guidelines
 * Location: /components/resources/ResourceCard.tsx
 */
import Link from 'next/link'
import { BrandImageContainer } from '@/components/brand/BrandImageContainer'

interface ResourceCardProps {
  title: string
  description: string
  category?: string
  image?: string
  href?: string
  link?: string
  className?: string
}

export function ResourceCard({ 
  title, 
  description, 
  category = 'Resource', 
  image, 
  href,
  link,
  className = '' 
}: ResourceCardProps) {
  const url = href || link
  
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (url) {
      return (
        <Link 
          href={url}
          className={`block bg-white border border-[var(--sand-gray)] rounded-lg overflow-hidden 
                    hover:shadow-lg transition-shadow duration-200 ${className}`}
        >
          {children}
        </Link>
      )
    }
    
    return (
      <div className={`block bg-white border border-[var(--sand-gray)] rounded-lg overflow-hidden ${className}`}>
        {children}
      </div>
    )
  }
  
  return (
    <CardWrapper>
      {image && (
        <BrandImageContainer
          src={image}
          alt={title}
          category="energy"
          className="h-48"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-[var(--spring-green-20)] 
                          text-[var(--moss-green)] text-caption font-body-medium rounded-full">
            {category}
          </span>
        </div>
        
        <h3 className="text-body-large font-body-semibold text-[var(--midnight-forest)] mb-2">
          {title}
        </h3>
        
        <p className="text-body text-[var(--moss-green)] leading-relaxed">
          {description}
        </p>
        
        {url && (
          <div className="mt-4 flex items-center text-[var(--spring-green)] hover:text-[var(--moss-green)] transition-colors">
            <span className="text-body-small font-body-medium">Learn more</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        )}
      </div>
    </CardWrapper>
  )
} 