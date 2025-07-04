import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <UtensilsCrossed className="mx-auto h-24 w-24 text-muted-foreground/50" />
      <h1 className="mt-8 text-4xl font-headline font-bold">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Oops! The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  )
}
