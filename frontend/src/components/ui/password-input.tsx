import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, type, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-3 top-0 flex h-full items-center text-slate-500 transition-colors hover:text-slate-900"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
