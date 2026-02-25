// import * as React from "react";

// import { cn } from "@/lib/utils";

// const Input = React.forwardRef(({ className, type, ...props }, ref) => {
//   return (
//     <input
//       type={type}
//       className={cn(
//         "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base " +
//           "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
//           "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
//           "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
//         className,
//       )}
//       ref={ref}
//       {...props}
//     />
//   );
// });

// Input.displayName = "Input";

// export default Input;

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, type = "text", value, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base " +
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground " +
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
            "focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        value={value ?? ""} // <-- fallback to empty string to stay controlled
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
