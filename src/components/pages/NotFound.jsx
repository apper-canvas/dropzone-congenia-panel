import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 max-w-md"
      >
        {/* 404 Animation */}
        <div className="relative">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl font-bold text-gradient mb-4"
          >
            404
          </motion.div>
          
          {/* Floating Cloud */}
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              x: [-5, 5, -5]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-8 text-primary/30"
          >
            <ApperIcon name="Cloud" className="w-16 h-16" />
          </motion.div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for seems to have drifted away like a cloud. 
            Don't worry, let's get you back to uploading files!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate("/")}
            icon="Home"
            size="lg"
          >
            Back to DropZone
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            icon="ArrowLeft"
            size="lg"
          >
            Go Back
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="flex items-center justify-center gap-8 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <ApperIcon name="Upload" className="w-6 h-6 text-primary" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ApperIcon name="File" className="w-6 h-6 text-secondary" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <ApperIcon name="CloudUpload" className="w-6 h-6 text-accent" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;