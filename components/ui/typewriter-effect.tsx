"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  return (
    <div
      className={cn(
        "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
        className
      )}
    >
      {wordsArray.map((word, idx) => {
        return (
          <span key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <motion.span
                initial={{}}
                animate={{}}
                transition={{
                  duration: 0.5,
                }}
                key={`char-${index}`}
                className={cn(`dark:text-white text-black`, word.className)}
              >
                {char}
              </motion.span>
            ))}
            &nbsp;
          </span>
        );
      })}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block rounded-sm w-[4px] h-8 md:h-12 lg:h-16 bg-blue-500",
          cursorClassName
        )}
      />
    </div>
  );
};