"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PhoneColor,
  PhoneFinishes,
  PhoneMaterial,
  PhoneModel,
} from "@prisma/client";

type PhoneModelWithVariants = PhoneModel & {
  phoneColors: PhoneColor[];
  phoneMaterials: PhoneMaterial[];
  phoneFinishes: PhoneFinishes[];
};

interface ModelSelectorProps {
  selectedModel: PhoneModelWithVariants;
  handleModelChange: (modelId: string) => void;
  phoneModels: PhoneModelWithVariants[];
}

export function ModelSelector({
  selectedModel,
  handleModelChange,
  phoneModels,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  console.log(phoneModels);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedModel.name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search phone model..." />
          <CommandEmpty>No phone model found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {phoneModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={(modelId) => {
                    handleModelChange(modelId);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedModel.id === model.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {model.name}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
