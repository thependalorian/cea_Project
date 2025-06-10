/**
 * PartnerResourcesWidget Component
 * 
 * Purpose: Displays resources management widget for partner dashboard
 * Location: /components/partners/PartnerResourcesWidget.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PartnerResourcesWidgetProps {
  partnerId: string
  resources: Record<string, unknown>[]
  totalCount: number
}

export default function PartnerResourcesWidget({ partnerId, resources, totalCount }: PartnerResourcesWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Resources</span>
          <span className="text-sm font-normal text-muted-foreground">({totalCount})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.slice(0, 3).map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium text-sm">{(resource.title as string) || (resource.name as string) || 'Untitled Resource'}</p>
                  <p className="text-xs text-muted-foreground">
                    {resource.created_at ? new Date(resource.created_at as string).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {resources.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{resources.length - 3} more resources
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No resources yet</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Link href="/partners/resources">
            <Button className="w-full" variant="outline">
              View All Resources
            </Button>
          </Link>
          <Link href="/partners/resources/new">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 