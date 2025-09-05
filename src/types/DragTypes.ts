/**
 * Constants for drag and drop item types
 */
export const ItemTypes = {
  TOKEN: 'token',
  IMAGE: 'image',
  TEXT: 'text',
  SCENE: 'scene'
};

/**
 * Interface for token drag items
 */
export interface TokenDragItem {
  type: typeof ItemTypes.TOKEN;
  tokenKey: string;
  tokenValue: string;
  tokenDisplay: string;
}

/**
 * Interface for image drag items
 */
interface ImageDragItem {
  type: typeof ItemTypes.IMAGE;
  imageUrl: string;
}

/**
 * Interface for text drag items
 */
interface TextDragItem {
  type: typeof ItemTypes.TEXT;
  text: string;
}

/**
 * Interface for scene drag items
 */
interface SceneDragItem {
  type: typeof ItemTypes.SCENE;
  sceneId: string;
  order: number;
}