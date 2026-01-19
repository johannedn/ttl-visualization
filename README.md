# TTL Visualization

A React-based web application for visualizing and managing RDF/TTL (Turtle) ontologies. This tool enables users to explore ontology data through interactive graph and table views, with support for both local file uploads and API-based ontology management.

## Features

- **TTL File Parsing**: Parse and visualize RDF triples from Turtle (.ttl) files
- **Dual Visualization Modes**:
  - **Graph View**: Interactive force-directed graph visualization of ontology relationships
  - **Table View**: Tabular display of subject-predicate-object triples with selection capability
- **Multiple Data Sources**:
  - Upload local TTL files
  - Fetch ontologies from a backend API
- **Triple Selection**: Select specific triples from the table view to include in chat feedback
- **Chat Integration**: Send feedback and prompts to update ontologies via an integrated chat drawer
- **Dashboard Layout**: Material UI-based responsive layout with navigation sidebar

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI) 7
- **RDF Parsing**: N3.js and rdflib
- **Graph Visualization**: react-force-graph-2d
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── api/              # API client and service functions
├── components/       # Reusable UI components (GraphView, TableView, TTLUploader)
├── context/          # React context for ontology state management
├── layout/           # Layout components (Header, SideNav, ChatDrawer)
├── pages/            # Page components for routing
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (TTL parsing, triple utilities)
```

## API Integration

The application connects to a backend API for ontology management:

- `GET /api/ontologies` - Retrieve all ontologies
- `GET /api/ontologies/latest` - Get the latest ontology
- `POST /api/ontologies` - Update ontology with prompt and selected triples

## Usage

1. **Load an Ontology**: Either upload a local `.ttl` file or fetch from the API
2. **Explore Data**: Switch between graph and table views to analyze the ontology
3. **Select Triples**: In table view, select specific triples of interest
4. **Provide Feedback**: Use the chat drawer to send prompts and selected triples to update the ontology

## License

Private project - All rights reserved
