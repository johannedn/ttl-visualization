# TTL Visualization

A React-based web application for visualizing and managing RDF/TTL (Turtle) ontologies. This tool enables users to explore ontology data through interactive graph and table views, with support for both local file uploads and API-based ontology management.

## Features

### Visualization
- **TTL File Parsing**: Parse and visualize RDF triples from Turtle (.ttl) files using N3.js
- **Interactive Graph View**: 
  - Force-directed graph visualization with node clustering
  - Click nodes to explore relationships
  - Fullscreen mode for detailed exploration
  - Color-coded nodes by type (subject, predicate, object)
- **Table View**: 
  - Tabular display of subject-predicate-object triples
  - Multi-select triples with checkboxes
  - Column-based filtering for subjects, predicates, and objects
  - Pagination for large datasets
  - Search functionality across all triple components

### Data Management
- **Data Source**: Backend API with auto-fetch on load and manual refresh capability
- **Change History**:
  - View complete ontology modification history
  - Compare versions side-by-side
  - Track added/removed triples per version
  - Filter history by search terms

### Interactive Editing
- **Triple Selection**: Select specific triples to provide context for ontology updates
- **Real-time Chat Integration**: 
  - WebSocket-based communication with backend
  - Send natural language prompts to refine ontology
  - Include selected triples as context
  - Auto-reload ontology after successful changes
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
- **Backend server running** (see Backend Setup below)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

### Backend Setup

This frontend requires the `Prototype_Phase1` backend to be running:

```bash
# In a separate terminal, navigate to backend directory
cd ../Prototype_Phase1

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate   # On Windows

# Start the backend API
python api.py --profile <profile-name>
```

The backend runs on `http://localhost:8000` by default. The frontend is configured to connect to this URL.

###Configuration

The frontend is currently configured to connect to:
- **API Base URL**: `http://localhost:8000`
- **WebSocket URL**: `ws://localhost:8000/ws/chat`

These URLs are defined in:
- API Client: `src/api/axiosClient.ts`
- Chat WebSocket: `src/context/useOntologyChat.ts`

### Basic Workflow

1. **Load an Ontology**: The latest ontology is automatically loaded on startup. Use the reload button to manually refresh from the API.

2. **Explore the Ontology**:
   - **Graph View**: Navigate the interactive graph, click nodes to see relationships
   - **Table View**: Browse all triples in tabular format
   - Use filters to narrow down subjects, predicates, or objects
   - Search across all triple components

3. **View Change History**:
   - Navigate to the History page
   - See all ontology modifications with timestamps
   - Click on any version to view added/removed triples

4. **Edit via Chat**:
   - Select relevant triples in Table or Graph view
   - Open the chat drawer (button in top-right)
   - Type natural language instructions like:
     - "Add a new class Building with parent Structure"
     - "Remove this triple"
     - "Map Entity A to Entity B with relation hasComponent"
   - Confirm or reject proposed changes
   - The ontology reloads automatically after successful edits

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search bar (where available)
- `Esc`: Close dialogs and deselect

## Troubleshooting

### Frontend won't start
- Ensure Node.js v18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts (default: 5173)

### "Failed to load ontology from backend"
- Verify the backend is running on `http://localhost:8000`
- Check backend logs for errors
- Ensure CORS is enabled in the backend

### WebSocket connection fails
- Confirm backend WebSocket endpoint is accessible
- Check browser console for connection errors
- Verify firewall/proxy settings allow WebSocket connections

### Graph view is slow
- The application limits display to 5000 triples for performance
- Use filters to reduce the visible dataset
- Consider using Table view for large ontologies

## Browser Support

- Chrome/Edge: Latest 2 versions (recommended)
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
The application connects to a backend API for ontology management:

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ontologies/latest` | Fetch the most recent ontology file |
| `GET` | `/api/ontologies` | List all available ontology files |
| `GET` | `/api/history` | Retrieve ontology change history |
| `GET` | `/api/history/{version_id}` | Get details for a specific version |

### WebSocket

- `WS /ws/chat` - Real-time bidirectional communication for ontology editing
  - **Send**: Natural language instructions + selected triples
  - **Receive**: Status updates, confirmations, ontology change notification
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

1. **Load an Ontology**: The ontology is automatically fetched from the API on startup
2. **Explore Data**: Switch between graph and table views to analyze the ontology
3. **Select Triples**: In table view, select specific triples of interest
4. **Provide Feedback**: Use the chat drawer to send prompts and selected triples to update the ontology

## License

Private project - All rights reserved
