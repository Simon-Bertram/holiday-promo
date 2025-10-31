// js/cloudinary-config.js

const CLOUDINARY_CONFIG = {
  cloudName: "dulwhlyqt", // Replace with your actual cloud name
};

// Initialize Cloudinary (we'll add this script tag to HTML)

type CloudinaryGlobal = {
  cloudinary?: {
    Cloudinary: {
      new: (options: { cloud_name: string; secure?: boolean }) => unknown;
    };
  };
};

const w =
  typeof window !== "undefined"
    ? (window as unknown as CloudinaryGlobal)
    : undefined;

export const cloudinary = w?.cloudinary
  ? w.cloudinary.Cloudinary.new({
      cloud_name: CLOUDINARY_CONFIG.cloudName,
      secure: true,
    })
  : null;
