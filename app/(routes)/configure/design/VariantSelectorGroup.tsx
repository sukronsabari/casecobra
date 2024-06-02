"use client";

import { RadioGroup, Label, Radio, Description } from "@headlessui/react";
import { formatPrice, cn } from "@/lib/utils";
import { PhoneFinishes, PhoneMaterial } from "@prisma/client";
import { Fragment } from "react";

interface VariantSelectorGroupProps {
  label: string;
  selectedValue: PhoneFinishes | PhoneMaterial;
  onChange: (id: string) => void;
  optionsData: PhoneFinishes[] | PhoneMaterial[];
}
export function VariantSelectorGroup({
  label,
  selectedValue,
  onChange,
  optionsData,
}: VariantSelectorGroupProps) {
  return (
    <RadioGroup value={selectedValue.id} onChange={onChange}>
      <Label className="capitalize">{label}</Label>
      <div className="mt-3 space-y-4">
        {optionsData.map((item) => (
          <Radio key={item.id} value={item.id} as={Fragment}>
            {({ checked }) => (
              <div
                className={cn(
                  "relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-gray-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
                  { "border-primary": checked }
                )}
              >
                <div className="flex items-center">
                  <span className="flex flex-col text-sm">
                    <span>{item.name}</span>
                    {item?.description && (
                      <span className="text-muted-foreground">
                        {item?.description}
                      </span>
                    )}
                  </span>
                </div>

                <Description
                  as="span"
                  className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"
                >
                  <span className="font-meidum text-gray-900">
                    {formatPrice(item.price / 100)}
                  </span>
                </Description>
              </div>
            )}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
