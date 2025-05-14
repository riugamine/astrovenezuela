'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/lib/types/database.types";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Categorías</h3>
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id.toString()}>
            <AccordionTrigger className="text-sm">{category.name}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id={`all-${category.id}`} />
                  <label
                    htmlFor={`all-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Todos
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}