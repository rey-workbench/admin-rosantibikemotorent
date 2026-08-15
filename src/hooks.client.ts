import type { HandleClientError } from "@sveltejs/kit";

export const handleError: HandleClientError = ({ error }) => {
  if (import.meta.env.DEV) {
    console.error("Client error:", error);
  }
  return {
    message: "Terjadi kesalahan pada sistem.",
  };
};
