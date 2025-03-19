
// This file now acts as a re-export to maintain backward compatibility
// Importing the new refactored hooks
import { useUserData as useRefactoredUserData } from "./auth";

export const useUserData = useRefactoredUserData;
