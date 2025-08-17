export const webDateInputWrapper = {
  marginBottom: 16,
  borderRadius: 24,
  backgroundColor: "#ffffff",
  height: 48,
  paddingHorizontal: 16,
  justifyContent: "center",
} as const;

export const webDateLabel = {
  position: "absolute",
  left: 20,
  top: 14,
  fontSize: 16,
  color: "#bbb",
  fontWeight: "bold",
} as const;

export const webDateInput = {
  border: "none",
  outline: "none",
  fontSize: 16,
  fontWeight: "bold",
  color: "#bbb",
  backgroundColor: "transparent",
  width: "100%",
  height: "100%",
  borderRadius: 24,
};
export const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }); // e.g. Jul 31, 2025
};
