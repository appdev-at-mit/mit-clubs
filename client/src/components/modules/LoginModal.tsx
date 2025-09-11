import { createPortal } from "react-dom";
import { redirectToLogin } from "../../auth/auth";
import { FaTimes } from "react-icons/fa";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  const handleLoginClick = () => {
    redirectToLogin();
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        console.log("Backdrop clicked");
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FaTimes size={18} />
        </button>

        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Login Required
          </h3>
          <p className="text-gray-600">
            You need to be logged in to save clubs to your profile.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleLoginClick}
            className="bg-appdev-blue text-white px-6 py-3 rounded-md hover:bg-appdev-blue-dark font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default LoginModal;
