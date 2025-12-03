export enum AppTab {
  GENERATOR = 'generator',
  IMAGE_EDITOR = 'image_editor',
  VIDEO_ANIMATOR = 'video_animator'
}

export interface GeneratorInputs {
  productLink: string;
  ratio: string;
  visualStyle: string;
  tone: string;
}

export interface AngleResult {
  title: string;
  content: string;
}

export interface AnalysisResult {
  raw: string;
  generalAnalysis: string;
  angles: AngleResult[];
}

export interface ImageEditInputs {
  image: File | null;
  prompt: string;
}

export interface VideoGenInputs {
  image: File | null;
  prompt: string; // Optional prompt for Veo
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}