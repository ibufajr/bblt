'use client';

import { useState, useCallback } from 'react';
import { APIClient, type APIConfig, type ChatMessage } from '@/lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<CodeFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  const getAPIConfig = (): APIConfig => {
    try {
      const savedSettings = localStorage.getItem('smartbuild-api-settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      const provider = settings.selectedProvider || 'openrouter';
      let apiKey = '';
      let baseUrl = '';

      // Get API key based on selected provider
      switch (provider) {
        case 'openrouter':
          apiKey = settings.openrouterKey || '';
          baseUrl = 'https://openrouter.ai/api/v1';
          break;
        case 'openai':
          apiKey = settings.openaiKey || '';
          baseUrl = 'https://api.openai.com/v1';
          break;
        case 'anthropic':
          apiKey = settings.anthropicKey || '';
          baseUrl = 'https://api.anthropic.com/v1';
          break;
        case 'google':
          apiKey = settings.googleKey || '';
          baseUrl = 'https://generativelanguage.googleapis.com/v1';
          break;
        default:
          apiKey = settings.openrouterKey || '';
          baseUrl = 'https://openrouter.ai/api/v1';
      }
      
      return {
        provider: provider,
        apiKey: apiKey,
        baseUrl: baseUrl,
        model: settings.selectedModel || 'openai/gpt-4o',
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 2000,
        topP: settings.topP || 1,
        frequencyPenalty: settings.frequencyPenalty || 0,
        presencePenalty: settings.presencePenalty || 0
      };
    } catch (error) {
      console.error('Error reading API settings:', error);
      // Default settings
      return {
        provider: 'openrouter',
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'openai/gpt-4o',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0
      };
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    // Add generating message
    const generatingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, generatingMessage]);

    try {
      const apiConfig = getAPIConfig();
      
      // Check if API key exists for providers that require it
      if (!apiConfig.apiKey && apiConfig.provider !== 'custom') {
        throw new Error(`No API key set for ${apiConfig.provider}. Please configure an API key in settings.`);
      }

      // Check for test/demo keys
      if (apiConfig.apiKey && (apiConfig.apiKey.includes('test') || apiConfig.apiKey.includes('demo') || apiConfig.apiKey.includes('example'))) {
        throw new Error('Test/demo API keys are not functional. Please enter a real API key.');
      }

      const apiClient = new APIClient(apiConfig);
      
      // Setup messages for sending
      const systemPrompt = localStorage.getItem('smartbuild-api-settings') ? 
        JSON.parse(localStorage.getItem('smartbuild-api-settings')!).systemPrompt :
        'You are a helpful AI assistant specialized in software development. You provide accurate, helpful responses and assist in creating complete software projects.';

      const chatMessages: ChatMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages.filter(m => !m.isGenerating).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        {
          role: 'user',
          content: content
        }
      ];

      // Send message to API
      const response = await apiClient.sendMessage(chatMessages);

      // Generate mock project based on response
      const mockProject = generateMockProject(content);
      setGeneratedFiles(mockProject.files);
      setPreviewUrl('http://localhost:3001');
      setCurrentProject(mockProject.name);

      // Update the generating message with actual response
      const assistantMessage: Message = {
        id: generatingMessage.id,
        role: 'assistant',
        content: response + `\n\n✅ Successfully created project **${mockProject.name}**!\n\nYou can now:\n- View the code in the "Code" tab\n- See the live preview in the "Preview" tab\n- Download the project as a ZIP file`,
        timestamp: new Date(),
        isGenerating: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === generatingMessage.id ? assistantMessage : msg
      ));

    } catch (error) {
      console.error('Error creating project:', error);
      
      let errorMessage = 'Sorry, an error occurred while processing your request.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      const finalErrorMessage: Message = {
        id: generatingMessage.id,
        role: 'assistant',
        content: `${errorMessage}\n\nPlease check:\n- API settings in the settings menu\n- API key validity\n- Internet connection\n- Custom server settings (if applicable)`,
        timestamp: new Date(),
        isGenerating: false
      };

      setMessages(prev => prev.map(msg => 
        msg.id === generatingMessage.id ? finalErrorMessage : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  }, [messages]);

  const generateMockProject = (prompt: string) => {
    const isEcommerce = prompt.includes('store') || prompt.includes('shop') || prompt.includes('ecommerce');
    const isBlog = prompt.includes('blog') || prompt.includes('article');
    const isDashboard = prompt.includes('dashboard') || prompt.includes('admin');
    const isGame = prompt.includes('game') || prompt.includes('tic tac toe') || prompt.includes('space invaders');

    if (isGame) {
      return {
        name: 'Game Project',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tic Tac Toe Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .game-container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .board {
            display: grid;
            grid-template-columns: repeat(3, 100px);
            grid-gap: 5px;
            margin: 20px auto;
            background: #333;
            padding: 5px;
            border-radius: 10px;
        }
        .cell {
            width: 100px;
            height: 100px;
            background: white;
            border: none;
            font-size: 2rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .cell:hover {
            background: #f0f0f0;
            transform: scale(0.95);
        }
        .cell.x { color: #e74c3c; }
        .cell.o { color: #3498db; }
        .status {
            font-size: 1.5rem;
            margin: 20px 0;
            font-weight: bold;
        }
        .reset-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 1rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .reset-btn:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>Tic Tac Toe</h1>
        <div class="status" id="status">Player X's turn</div>
        <div class="board" id="board">
            <button class="cell" data-index="0"></button>
            <button class="cell" data-index="1"></button>
            <button class="cell" data-index="2"></button>
            <button class="cell" data-index="3"></button>
            <button class="cell" data-index="4"></button>
            <button class="cell" data-index="5"></button>
            <button class="cell" data-index="6"></button>
            <button class="cell" data-index="7"></button>
            <button class="cell" data-index="8"></button>
        </div>
        <button class="reset-btn" onclick="resetGame()">Reset Game</button>
    </div>

    <script>
        let currentPlayer = 'X';
        let gameBoard = ['', '', '', '', '', '', '', '', ''];
        let gameActive = true;

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        function handleCellClick(event) {
            const clickedCell = event.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

            if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
                return;
            }

            gameBoard[clickedCellIndex] = currentPlayer;
            clickedCell.textContent = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());

            checkResult();
        }

        function checkResult() {
            let roundWon = false;
            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                    roundWon = true;
                    break;
                }
            }

            if (roundWon) {
                document.getElementById('status').textContent = \`Player \${currentPlayer} wins!\`;
                gameActive = false;
                return;
            }

            if (!gameBoard.includes('')) {
                document.getElementById('status').textContent = 'Game ended in a draw!';
                gameActive = false;
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            document.getElementById('status').textContent = \`Player \${currentPlayer}'s turn\`;
        }

        function resetGame() {
            currentPlayer = 'X';
            gameBoard = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            document.getElementById('status').textContent = "Player X's turn";
            
            document.querySelectorAll('.cell').forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o');
            });
        }

        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    </script>
</body>
</html>`,
            language: 'html',
            path: 'index.html'
          }
        ]
      };
    }

    if (isEcommerce) {
      return {
        name: 'E-commerce Store',
        files: [
          {
            name: 'package.json',
            content: JSON.stringify({
              name: 'ecommerce-store',
              version: '1.0.0',
              scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start'
              },
              dependencies: {
                'next': '^14.0.0',
                'react': '^18.0.0',
                'react-dom': '^18.0.0',
                'tailwindcss': '^3.0.0'
              }
            }, null, 2),
            language: 'json',
            path: 'package.json'
          },
          {
            name: 'page.tsx',
            content: `'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

export default function Home() {
  const [cart, setCart] = useState([]);
  
  const products = [
    { id: 1, name: 'Smartphone', price: 699, image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, name: 'Laptop', price: 1299, image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 3, name: 'Headphones', price: 199, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Store</h1>
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-6 w-6" />
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                {cart.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${'$'}{product.price}
                  </span>
                  <button 
                    onClick={() => setCart([...cart, product])}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
            language: 'tsx',
            path: 'app/page.tsx'
          }
        ]
      };
    }

    // Default project
    return {
      name: 'New Project',
      files: [
        {
          name: 'package.json',
          content: JSON.stringify({
            name: 'my-app',
            version: '1.0.0',
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start'
            },
            dependencies: {
              'next': '^14.0.0',
              'react': '^18.0.0',
              'react-dom': '^18.0.0',
              'tailwindcss': '^3.0.0'
            }
          }, null, 2),
          language: 'json',
          path: 'package.json'
        },
        {
          name: 'page.tsx',
          content: `'use client';

import { useState } from 'react';
import { Heart, Star, Zap } from 'lucide-react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600">AI-Generated Application</p>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">{count}</div>
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Click Me
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-gray-400">
          <Heart className="h-5 w-5" />
          <Star className="h-5 w-5" />
          <Zap className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}`,
          language: 'tsx',
          path: 'app/page.tsx'
        }
      ]
    };
  };

  return {
    messages,
    isGenerating,
    sendMessage,
    generatedFiles,
    previewUrl,
    currentProject
  };
}