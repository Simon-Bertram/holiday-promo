export const ERROR_MESSAGES = {
  UNAUTHORIZED: {
    ACCESS_RESOURCE: "You must be logged in to access this resource",
  },
  FORBIDDEN: {
    ACCESS_RESOURCE: "You are not authorized to access this resource",
    UPDATE_PROFILE: "Only subscribers can update their profiles",
  },
  CONFLICT: {
    EMAIL_EXISTS: "That email address is already in use",
  },
  NOT_FOUND: {
    UPDATE_PROFILE: "Unable to update profile",
  },
} as const;
