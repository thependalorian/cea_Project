/**
 * PartnerEducationWidget Component
 * 
 * Purpose: Displays education programs widget for partner dashboard
 * Location: /components/partners/PartnerEducationWidget.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

interface PartnerEducationWidgetProps {
  totalPrograms: number
}

export default function PartnerEducationWidget({ totalPrograms }: PartnerEducationWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Education Programs</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{totalPrograms}</div>
          <div className="text-sm text-muted-foreground">Active Programs</div>
        </div>
        
        {totalPrograms === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No education programs yet</p>
            <p className="text-xs">Start creating programs to help job seekers</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Link href="/partners/education">
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Programs
            </Button>
          </Link>
          <Link href="/partners/education/new">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 