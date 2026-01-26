import * as React from "react"
import { NumericFormat, type NumericFormatProps } from "react-number-format"
import { Input } from "@/components/ui/input"

export interface MoneyInputProps
  extends Omit<NumericFormatProps, "customInput"> {
  onValueChange?: (values: { floatValue: number | undefined; formattedValue: string; value: string }) => void;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, onValueChange, ...props }, ref) => {
    return (
      <NumericFormat
        customInput={Input}
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp "
        onValueChange={onValueChange}
        getInputRef={ref}
        {...props}
      />
    )
  }
)
MoneyInput.displayName = "MoneyInput"

export { MoneyInput }
