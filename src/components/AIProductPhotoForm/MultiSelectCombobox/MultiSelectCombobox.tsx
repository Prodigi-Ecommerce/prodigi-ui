// Types
import type { FieldError } from 'react-hook-form'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command.tsx'
import { cn } from '@/lib/utils.ts'
import type { Option } from '@/types/option.ts'

interface MultiSelectComboboxProps {
  options: Option[]
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: FieldError
}

// Multi-select combobox component (now controlled for React Hook Form)
export const MultiSelectCombobox = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select items...',
  error,
}: MultiSelectComboboxProps) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedValue: string) => {
    let newValue
    if (value.includes(selectedValue)) {
      newValue = value.filter((item) => item !== selectedValue)
    } else {
      newValue = [...value, selectedValue]
    }
    onChange(newValue)
  }

  const handleRemove = (selectedValue: string) => {
    const newValue = value.filter((item) => item !== selectedValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between min-h-10',
              error && 'border-red-500'
            )}
          >
            <div className="flex gap-1 flex-wrap">
              {value.length > 0 ? (
                value.map((selectedValue) => (
                  <Badge
                    variant="secondary"
                    key={selectedValue}
                    className="mr-1 mb-1"
                  >
                    <span className="capitalize">{selectedValue}</span>
                    <div
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRemove(selectedValue)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={() => handleRemove(selectedValue)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </div>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search garment types..." />
            <CommandEmpty>No garment type found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="capitalize">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
