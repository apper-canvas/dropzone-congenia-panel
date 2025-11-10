import { motion } from "framer-motion";
import FileUploader from "@/components/organisms/FileUploader";

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50 py-8"
    >
      <FileUploader />
    </motion.div>
  );
};

export default Home;