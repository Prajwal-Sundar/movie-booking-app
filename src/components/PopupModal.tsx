import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PopupModalProps {
  show: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
  children?: React.ReactNode; // ✅ allows adding buttons or extra UI inside
}

const PopupModal: React.FC<PopupModalProps> = ({
  show,
  title = "Notification",
  message,
  onClose,
  type = "info",
  children,
}) => {
  const headerFooterGradient =
    type === "success"
      ? "from-green-500 to-emerald-500"
      : type === "error"
      ? "from-pink-500 to-red-500"
      : "from-purple-500 to-pink-500";

  // 🎨 Background tint for body
  const bodyBackground =
    type === "success"
      ? "bg-green-50"
      : type === "error"
      ? "bg-rose-50"
      : "bg-indigo-50";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-2xl shadow-2xl w-11/12 sm:w-96 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div
              className={`bg-gradient-to-r ${headerFooterGradient} text-white py-3 px-4 flex justify-center items-center relative`}
            >
              <h2 className="text-lg font-bold text-center w-full">{title}</h2>
              <button
                onClick={onClose}
                className="absolute right-4 text-white hover:text-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className={`${bodyBackground} text-gray-800 p-6 text-center`}>
              <p className="text-base leading-relaxed font-medium">{message}</p>
              {children && <div className="mt-4">{children}</div>}
            </div>

            {/* Footer */}
            <div
              className={`bg-gradient-to-r ${headerFooterGradient} py-3 flex justify-center`}
            >
              <button
                onClick={onClose}
                className="bg-white text-gray-800 font-semibold px-5 py-2 rounded-xl shadow hover:scale-105 transform transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupModal;
