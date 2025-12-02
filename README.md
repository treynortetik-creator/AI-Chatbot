# AI Chatbot with OpenRouter Integration

A full-featured, client-side AI chatbot application built with React 19 and TypeScript. Access multiple AI models through OpenRouter API with streaming responses, multi-project management, and persistent context files.

## Features

### 🔐 User Authentication
- Client-side authentication with SHA-256 password hashing
- User registration and login
- Session management with localStorage
- User-scoped data isolation

### 📁 Multi-Project Management
- Create unlimited chat projects
- Custom instructions per project
- Project-specific settings (model, temperature, max tokens)
- Persistent context files
- Independent chat histories

### 💬 Advanced Chat Interface
- Real-time streaming responses (SSE)
- Markdown rendering with syntax highlighting
- File attachments (images and text files)
- Message history with timestamps
- Token counting and usage tracking

### 📄 Context Files System
- Add persistent files to project context
- Automatic token counting
- Support for various text file formats
- Visual file management interface

### ⚙️ Comprehensive Settings
- OpenRouter API key management
- Model selection (Claude, GPT-4, Gemini, Llama, etc.)
- Theme control (Light/Dark/Auto)
- Font size adjustment
- Streaming toggle
- Token warning thresholds

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark mode support
- Smooth animations and transitions
- Mobile-friendly interface
- Beautiful gradient authentication screens

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with CSS Variables
- **API**: OpenRouter (streaming SSE)
- **Storage**: localStorage (client-side only)
- **Markdown**: react-markdown with remark-gfm
- **Syntax Highlighting**: react-syntax-highlighter
- **Token Counting**: js-tiktoken
- **Icons**: lucide-react
- **Animations**: framer-motion
- **Date Formatting**: date-fns

## Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Getting Started

### 1. Create an Account

- Click "Sign up" on the authentication screen
- Enter a username (minimum 3 characters)
- Enter a password (minimum 6 characters)
- Confirm your password
- Click "Create Account"

You'll be automatically logged in after registration.

### 2. Configure API Key

- Click the Settings icon (⚙️) in the top right
- Enter your OpenRouter API key
- Select your preferred default model
- Adjust other settings as needed
- Click "Save Settings"

### 3. Create a Project

- Click the "+" button in the sidebar
- Enter a project name
- (Optional) Add a description
- (Optional) Add custom instructions for the AI
- Click "Create Project"

### 4. Start Chatting

- Select your project from the sidebar
- Type your message in the input box
- (Optional) Attach files using the paperclip icon
- Press Enter or click Send
- Watch as the AI responds in real-time!

## Project Structure

```
AI-Chatbot/
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Chat/           # Chat interface components
│   │   ├── Common/         # Reusable UI components
│   │   ├── Files/          # Context files management
│   │   ├── Layout/         # App layout components
│   │   ├── Project/        # Project management components
│   │   └── Settings/       # Settings panel
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── ProjectContext.tsx
│   │   └── SettingsContext.tsx
│   ├── services/           # Business logic services
│   │   ├── AuthService.ts
│   │   ├── StorageService.ts
│   │   ├── OpenRouterAPI.ts
│   │   ├── FileProcessor.ts
│   │   └── TokenCounter.ts
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Authentication
All user data is stored locally in the browser using localStorage. Passwords are hashed using SHA-256 with a random salt. **Note**: This is for demonstration purposes only. For production use, implement proper backend authentication.

### Project Management
Each project maintains:
- Separate chat history
- Custom instructions (system prompt)
- Context files (persistent across conversations)
- Project-specific model settings

### Context Files
Add text files to your project that will be included in every conversation:
- Supports: .txt, .md, .js, .ts, .jsx, .tsx, .json, .py, .java, .html, .css, and more
- Automatic token counting
- Visual file size and token display
- Easy removal of files

### Streaming Responses
Real-time response streaming using Server-Sent Events (SSE):
- See responses as they're generated
- Stop generation at any time
- Smooth typing animation
- Error handling and recovery

### Token Counting
Track your API usage with built-in token counting:
- Message-level token counts
- Context file token counts
- Total conversation tokens
- Warning when approaching limits

### Dark Mode
Three theme options:
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes
- **Auto**: Follows system preference

## Supported Models

Via OpenRouter, you can access:
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **OpenAI**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Google**: Gemini Pro
- **Meta**: Llama 3.1 70B Instruct
- And many more!

## Security Notes

⚠️ **Important Security Considerations**:

- This is a **client-side only** application
- All data is stored in browser localStorage
- API keys are stored in plain text in localStorage
- Password hashing is client-side only
- **Not suitable for production without a proper backend**

For production use, you should:
- Implement server-side authentication
- Store API keys securely on the backend
- Use HTTPS
- Implement rate limiting
- Add proper error logging
- Use environment variables

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Optimization

The build is optimized with:
- Manual chunk splitting (React, markdown, syntax highlighter)
- Code splitting for better load times
- CSS minification
- Tree shaking

## Storage

All data is stored in localStorage under the following keys:
- `chatbot_users` - User accounts
- `chatbot_session` - Current session
- `chatbot_{userId}_projects` - User's projects
- `chatbot_{userId}_messages_{projectId}` - Project messages
- `chatbot_{userId}_settings` - User settings
- `chatbot_{userId}_activeProjectId` - Active project

## Troubleshooting

### API Key Not Working
- Verify your API key is correct
- Check you have credits on OpenRouter
- Try a different model

### Streaming Not Working
- Check your internet connection
- Some networks block SSE
- Try disabling streaming in settings

### Dark Mode Not Applying
- Check browser compatibility
- Clear localStorage and refresh
- Verify theme setting in Settings panel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Powered by [OpenRouter](https://openrouter.ai/)
- Icons by [Lucide](https://lucide.dev/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)

## Support

For issues and questions:
- Check existing issues on GitHub
- Create a new issue with detailed information
- Include browser console errors if applicable

---

**Happy Chatting! 🚀**
