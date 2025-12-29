import { cn } from "@/lib/utils";

export type FilterOption = "all" | "original" | "updated";

interface FilterToggleProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
  counts: {
    all: number;
    original: number;
    updated: number;
  };
}

const FilterToggle = ({ value, onChange, counts }: FilterToggleProps) => {
  const options: { label: string; value: FilterOption }[] = [
    { label: "All", value: "all" },
    { label: "Original", value: "original" },
    { label: "Updated", value: "updated" },
  ];

  return (
    <div className="inline-flex items-center p-1 bg-secondary rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-base",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
          <span
            className={cn(
              "ml-1.5 text-xs",
              value === option.value ? "text-muted-foreground" : "text-muted-foreground/60"
            )}
          >
            {counts[option.value]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterToggle;
