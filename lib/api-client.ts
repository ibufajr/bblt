interface APIConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class APIClient {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      switch (this.config.provider) {
        case 'openrouter':
          return await this.sendOpenRouterMessage(messages);
        case 'openai':
          return await this.sendOpenAIMessage(messages);
        case 'anthropic':
          return await this.sendAnthropicMessage(messages);
        case 'google':
          return await this.sendGoogleMessage(messages);
        case 'huggingface':
          return await this.sendHuggingFaceMessage(messages);
        case 'cohere':
          return await this.sendCohereMessage(messages);
        case 'groq':
          return await this.sendGroqMessage(messages);
        case 'mistral':
          return await this.sendMistralMessage(messages);
        case 'perplexity':
          return await this.sendPerplexityMessage(messages);
        case 'together':
          return await this.sendTogetherMessage(messages);
        case 'fireworks':
          return await this.sendFireworksMessage(messages);
        case 'replicate':
          return await this.sendReplicateMessage(messages);
        case 'custom':
          return await this.sendCustomMessage(messages);
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private async sendOpenRouterMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key required');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SmartBuild Pro'
      },
      body: JSON.stringify({
        model: this.config.model || 'openai/gpt-4',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`OpenRouter Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendOpenAIMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`OpenAI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendAnthropicMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key required');
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemMessage,
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Anthropic Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response received';
  }

  private async sendGoogleMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Google AI API key required');
    }

    const contents = messages.filter(m => m.role !== 'system').map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          topP: this.config.topP
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Google AI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response received';
  }

  private async sendGroqMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Groq API key required');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2-70b-4096',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Groq Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendMistralMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Mistral API key required');
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'mistral-large-latest',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Mistral Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendPerplexityMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Perplexity API key required');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama-3-sonar-large-32k-online',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Perplexity Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendTogetherMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Together AI API key required');
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'meta-llama/Llama-2-70b-chat-hf',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Together AI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendFireworksMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Fireworks AI API key required');
    }

    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'accounts/fireworks/models/llama-v2-70b-chat',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Fireworks AI Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async sendReplicateMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Replicate API key required');
    }

    // Note: Replicate has a different API structure, this is a simplified version
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: this.config.model || 'meta/llama-2-70b-chat',
        input: {
          prompt: prompt,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Replicate Error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.output?.join('') || 'No response received';
  }

  private async sendHuggingFaceMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API key required');
    }

    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.config.model || 'microsoft/DialoGPT-large'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: this.config.temperature,
          max_new_tokens: this.config.maxTokens,
          top_p: this.config.topP
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Hugging Face Error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'No response received';
  }

  private async sendCohereMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Cohere API key required');
    }

    const prompt = messages.map(m => m.content).join('\n');

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'command',
        prompt: prompt,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Cohere Error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.generations[0]?.text || 'No response received';
  }

  private async sendCustomMessage(messages: ChatMessage[]): Promise<string> {
    if (!this.config.baseUrl) {
      throw new Error('Custom API endpoint required');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Custom API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  async testConnection(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];
      
      await this.sendMessage(testMessages);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      switch (this.config.provider) {
        case 'openrouter':
          return await this.getOpenRouterModels();
        case 'openai':
          return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4-vision-preview'];
        case 'anthropic':
          return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
        case 'google':
          return ['gemini-pro', 'gemini-pro-vision'];
        case 'groq':
          return ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'];
        case 'mistral':
          return ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'];
        case 'perplexity':
          return ['llama-3-sonar-large-32k-online', 'llama-3-sonar-small-32k-online'];
        case 'together':
          return ['meta-llama/Llama-2-70b-chat-hf', 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'];
        case 'fireworks':
          return ['accounts/fireworks/models/llama-v2-70b-chat', 'accounts/fireworks/models/mixtral-8x7b-instruct'];
        case 'replicate':
          return ['meta/llama-2-70b-chat', 'mistralai/mixtral-8x7b-instruct-v0.1'];
        case 'huggingface':
          return ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill'];
        case 'cohere':
          return ['command', 'command-light', 'command-nightly'];
        default:
          return [];
      }
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  private async getOpenRouterModels(): Promise<string[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
    } catch (error) {
      console.error('Failed to get OpenRouter models:', error);
      return ['openai/gpt-4', 'anthropic/claude-3-opus', 'google/gemini-pro'];
    }
  }
}

export { APIClient, type APIConfig, type ChatMessage };