"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function TarotConfirmButton({ onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="w-full py-3 rounded-[5px] bg-[#5046e4] hover:bg-[#3d36c4] text-[#f4f0ff] font-medium text-sm transition-colors flex items-center justify-center gap-2"
    >
      선택 완료 <ArrowRight className="w-4 h-4" />
    </motion.button>
  );
}
