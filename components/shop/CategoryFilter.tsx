'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/lib/data/categories";

export function CategoryFilter() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Categorías</h3>
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-sm">{category.name}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-4">
                {/* Subcategorías como checkboxes */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="all" />
                  <label htmlFor="all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Todos
                  </label>
                </div>
                {/* Aquí irán las subcategorías dinámicamente */}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}