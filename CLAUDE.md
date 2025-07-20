# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Component Design System MCP Server** - a TypeScript-based Model Context Protocol server that helps AI assistants understand and work with existing component libraries. The primary goal is to prevent duplicate component creation and maintain design consistency by analyzing React Native and TailwindCSS component libraries.

## Common Commands

**Development:**
- `npm run dev` - Run development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production server
- `npm test` - Run full Jest test suite
- `npm run test:watch` - Run tests in watch mode

**Code Quality:**
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

## Architecture Overview

### Core MCP Server Pipeline
The system follows a **scanner → analyzer → cache → MCP tools** pipeline:

1. **Scanner** (`src/scanner/`) discovers component files in configured paths
2. **Analyzer** (`src/analyzer/`) extracts metadata via AST parsing (Babel parser)
3. **Cache** (`src/cache/`) provides performance optimization with file watching
4. **MCPServer** (`src/core/MCPServer.ts`) exposes 8 tools via MCP protocol

### Key MCP Tools Exposed
- `list_components` - Component summaries with filtering
- `get_component_details` - Detailed component analysis
- `find_similar_components` - Similarity-based search using vector analysis
- `get_design_system` - Extract design patterns and token usage
- `get_available_categories` - Auto-detected component categories
- `get_screen_patterns` - Common screen/page layouts
- `get_performance_metrics` - System diagnostics
- `get_error_report` - Error analysis with severity levels

### Configuration System
Configuration is managed through `component-mcp.config.json` with:
- **Scan paths**: Directories to analyze for components
- **Framework support**: React Native (StyleSheet.create) and TailwindCSS (className analysis)
- **Caching**: File watching with configurable refresh intervals
- **Exclude patterns**: Skip tests, build files, node_modules

### Component Analysis Capabilities
- **AST-based parsing** for accurate component structure extraction
- **Props analysis** including TypeScript interface detection
- **Style pattern recognition** for both StyleSheet and TailwindCSS
- **Similarity analysis** using feature vectors and cosine similarity
- **Design token extraction** from consistent patterns across components

## Framework Support

**React Native:**
- StyleSheet.create pattern detection
- Component props and interface analysis
- Screen vs component classification

**TailwindCSS:**
- className utility analysis
- Design token pattern extraction
- Responsive design pattern detection

## Testing

- **Jest** with ts-jest for TypeScript support
- **Integration tests** include sample React Native and TailwindCSS components in `tests/integration/`
- Test structure mirrors src directory
- Use `npm test` for full suite, `npm run test:watch` for development

## Performance & Monitoring

The system includes built-in performance monitoring:
- Cache hit/miss statistics
- Component analysis timing
- Memory usage tracking
- Error categorization (low, medium, high, critical severity)

Access via `get_performance_metrics` and `get_error_report` MCP tools.