
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "simple";
  onClick?: () => void;
  disableClick?: boolean;
}

const Logo = ({
  className,
  showText = true,
  size = "md",
  variant = "default",
  onClick,
  disableClick = false,
}: LogoProps) => {
  // Size mappings
  const sizeClasses = {
    sm: { icon: "h-6 w-6", text: "text-lg", spacing: "gap-1.5" },
    md: { icon: "h-8 w-8", text: "text-xl", spacing: "gap-2" },
    lg: { icon: "h-10 w-10", text: "text-2xl", spacing: "gap-3" },
  };

  // Animation variants
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 } 
    }
  };

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.3,
        duration: 0.4
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.4
      }
    }
  };

  // Only apply cursor-pointer and onClick if not disabled
  const containerProps = disableClick 
    ? { className: cn("flex items-center", sizeClasses[size].spacing, className) }
    : { 
        className: cn("flex items-center cursor-pointer", sizeClasses[size].spacing, className),
        onClick: onClick
      };

  return (
    <motion.div
      {...containerProps}
      initial="initial"
      animate="animate"
      whileHover={disableClick ? undefined : "hover"}
    >
      {/* Logo icon */}
      <motion.div 
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2",
          sizeClasses[size].icon
        )}
        variants={iconVariants}
      >
        <Check className={cn("absolute", variant === "simple" ? "h-4/5 w-4/5" : "h-3/5 w-3/5")} strokeWidth={3} />
        
        {variant === "default" && (
          <motion.div 
            className="absolute right-0 bottom-0 -translate-x-px -translate-y-px"
            variants={sparkleVariants}
          >
            <Sparkles className="h-2/5 w-2/5 text-amber-300" />
          </motion.div>
        )}
      </motion.div>

      {/* Logo text */}
      {showText && (
        <motion.div 
          className="flex flex-col items-start"
          variants={textVariants}
        >
          <span className={cn(
            "font-bold tracking-tight leading-none", 
            sizeClasses[size].text
          )}>
            <span className="text-blue-600">Cleaners</span>
            <span className="text-indigo-700">Check</span>
          </span>
          {size === "lg" && variant === "default" && (
            <span className="text-xs text-muted-foreground">Smart Cleaning Management</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Logo;
