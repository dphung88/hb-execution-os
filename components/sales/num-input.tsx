"use client";

import { useState } from "react";

type NumInputProps = {
  name: string;
  defaultValue?: number;
  className?: string;
};

export function NumInput({ name, defaultValue, className }: NumInputProps) {
  const [value, setValue] = useState(
    defaultValue != null ? defaultValue.toLocaleString("vi-VN") : ""
  );

  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        const cleaned = e.target.value.replace(/\./g, "").replace(",", ".");
        const n = parseFloat(cleaned);
        if (!isNaN(n)) setValue(n.toLocaleString("vi-VN"));
      }}
      className={className}
    />
  );
}
