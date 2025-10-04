# 🚀 XFlows - React Prototype

A modern React application built with **Vite**, **Biomejs**, and **Tailwind CSS** for rapid XState flows prototyping.

## ✨ Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Biomejs** - Instant formatting and linting
- 🎯 **Tailwind CSS** - Utility-first CSS framework (served from CDN)
- 📦 **Bun** - Ultra-fast JavaScript runtime and package manager
- ⚛️ **React 18** - Latest React with modern features
- 🔷 **TypeScript** - Full type safety and IntelliSense

## 🚀 Quick Start

### Prerequisites

Make sure you have [Bun](https://bun.sh/docs/installation) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd xflows
   ```

2. **Install dependencies with Bun:**
   ```bash
   bun install
   ```

3. **Start the development server:**
   ```bash
   bun dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

```bash
# Development
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build

# Code Quality
bun lint         # Run Biomejs linter
bun lint:fix     # Fix linting issues automatically
bun format       # Format code with Biomejs
bun check        # Run both linting and formatting
```

## 🏗️ Project Structure

```
xflows/
├── src/
│   ├── index.html      # HTML template with Tailwind CDN
│   ├── main.tsx        # React entry point
│   ├── App.tsx         # Main React component
│   └── vite-env.d.ts   # Vite types (auto-generated)
├── docs/               # Documentation files
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── biome.json          # Biomejs configuration
└── README.md          # This file
```

## ⚙️ Configuration

### Vite Configuration (`vite.config.ts`)

- **React Plugin**: Automatic JSX transformation
- **Development Server**: Port 3000 with auto-open
- **Build Output**: Optimized for production with source maps

### Biomejs Configuration (`biome.json`)

- **Formatting**: 2-space indentation, single quotes, semicolons
- **Linting**: Recommended rules + custom overrides
- **Import Organization**: Automatic import sorting
- **File Handling**: Covers `src/**/*`, `*.ts`, `*.tsx`

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2020 for modern JavaScript features
- **JSX**: React 17+ automatic JSX transformation
- **Strict Mode**: Enabled for better type safety
- **Path Mapping**: `@/*` aliases for `src/*`

## 🎨 Tailwind CSS

Tailwind CSS is loaded from CDN for rapid prototyping:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Custom configuration includes:
- **Primary Color**: `#3b82f6` (blue-500)
- **Secondary Color**: `#64748b` (slate-500)

## 🔧 Development Tips

### Hot Reload

Vite provides instant hot module replacement (HMR):
- Edit any `.tsx`, `.ts`, or `.css` file
- Changes appear instantly in the browser
- Component state is preserved during updates

### Biomejs Integration

- **Auto-format on save**: Configure your editor
- **Pre-commit hooks**: Run `bun check` before commits
- **CI/CD**: Add `bun check` to your pipeline

### Bun Benefits

Compared to npm/yarn:
- ⚡ **10x faster** dependency installation
- 🔄 **Built-in bundler** and test runner
- 📦 **Drop-in replacement** for npm scripts
- 🐕 **No node_modules** bloat

## 🌐 Browser Support

- **Modern Browsers**: Chrome 87+, Firefox 78+, Safari 14+
- **ES2020 Support**: Native modules and modern JavaScript
- **React 18**: Concurrent features and Suspense

## 📚 Learn More

### Vite
- [Vite Documentation](https://vitejs.dev/)
- [Vite + React Guide](https://vitejs.dev/guide/features.html#react-jsx)

### Biomejs
- [Biomejs Documentation](https://biomejs.dev/)
- [Configuration Options](https://biomejs.dev/configuration/)

### Bun
- [Bun Documentation](https://bun.sh/docs/)
- [Bun vs Other Runtimes](https://bun.sh/docs/benchmarks/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind CDN](https://tailwindcss.com/docs/installation/play-cdn)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `bunx git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `bun check`
5. Commit your changes: `bunx git commit -m 'Add amazing feature'`
6. Push to the branch: `bunx git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ⚡ Vite • 🎨 Biomejs • 🎯 Tailwind CSS • 📦 Bun</strong>
</p>
