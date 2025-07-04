"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat, PlusCircle } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary">
          <ChefHat className="h-8 w-8" />
          Recipe Hub
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
            <Button asChild>
                <Link href="/add-recipe">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Recipe
                </Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
