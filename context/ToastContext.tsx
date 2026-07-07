import { Alert } from "react-native";

export function useToast() {
  const notify = (type: "success" | "error", message: string) => {
    Alert.alert(type === "success" ? "Success" : "Error", message);
  };

  return {
    success: (message: string) => notify("success", message),
    error: (message: string) => notify("error", message),
  };
}
