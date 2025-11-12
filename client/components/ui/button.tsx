import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={className}
      disabled={disabled}
      {...props}
    />
  )
}