import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "ref"> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: Array<{ value: RPNInput.Country; label: string; }>;
};

const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    return (
      <RPNInput.default
        ref={ref}
        className={cn("flex", className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        defaultCountry="VE"
        smartCaret={false}
        value={value || undefined}
        onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>
  (({ className, ...props }, ref) => (
    <Input
      className={cn("rounded-e-lg rounded-s-none", className)}
      {...props}
      ref={ref}
    />
  ));
InputComponent.displayName = "InputComponent";

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];
  return Flag ? (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm">
      <Flag title={countryName} />
    </span>
  ) : null;
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3"
      disabled={disabled}
      onClick={() => {
        if (value === "VE") {
          onChange("VE");
        } else {
          onChange("VE");
        }
      }}
    >
      <FlagComponent country={value} countryName={value} />
    </Button>
  );
};

export { PhoneInput };