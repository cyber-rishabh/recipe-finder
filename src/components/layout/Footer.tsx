import { ChefHat, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-primary/10 p-2 rounded-lg">
              <ChefHat className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-headline font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Culinary Delights
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for food lovers</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Culinary Delights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
