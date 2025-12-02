export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

export interface ModelGroup {
  provider: string;
  models: OpenRouterModel[];
}

export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  usageCount: number;
}
