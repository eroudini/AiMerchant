import * as React from "react"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Switch({ className, defaultChecked, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      defaultChecked={defaultChecked}
      className={className}
      {...props}
    />
  )
}