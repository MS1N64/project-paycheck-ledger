import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID using UUID v4
export const generateUniqueId = (): string => {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('UUID generation failed, falling back to timestamp-based ID:', error);
    // Fallback to timestamp + random number for uniqueness
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Validate that an ID doesn't already exist in a list of projects
export const ensureUniqueProjectId = (projects: { id: string }[], proposedId?: string): string => {
  let newId = proposedId || generateUniqueId();
  
  // Keep generating new IDs until we find one that doesn't exist
  while (projects.some(project => project.id === newId)) {
    console.warn(`ID collision detected: ${newId}, generating new ID`);
    newId = generateUniqueId();
  }
  
  return newId;
};
