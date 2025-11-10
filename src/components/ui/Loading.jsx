import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50 to-purple-50">
      <div className="text-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto"
        >
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary"></div>
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading DropZone</h2>
          <p className="text-gray-500">Preparing your file uploader...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;