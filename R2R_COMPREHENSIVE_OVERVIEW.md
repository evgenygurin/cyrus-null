# R2R (RAG to Riches): Comprehensive Technical Overview

## Executive Summary

R2R (RAG to Riches) is a production-ready, open-source AI retrieval system designed for building, deploying, and scaling Retrieval-Augmented Generation (RAG) applications. Developed by SciPhi AI, R2R bridges the gap between experimental RAG implementations and enterprise-grade systems with multimodal support, knowledge graphs, hybrid search, and comprehensive orchestration capabilities.

**Repository**: https://github.com/SciPhi-AI/R2R  
**Documentation**: https://r2r-docs.sciphi.ai  
**License**: MIT  
**Primary Language**: Python (with JavaScript SDK available)

---

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Key Capabilities](#key-capabilities)
3. [Document Management & Ingestion](#document-management--ingestion)
4. [Collections System](#collections-system)
5. [Knowledge Graphs & GraphRAG](#knowledge-graphs--graphrag)
6. [Retrieval & Search](#retrieval--search)
7. [Advanced RAG Techniques](#advanced-rag-techniques)
8. [Agentic RAG](#agentic-rag)
9. [Conversations & Context Management](#conversations--context-management)
10. [Deduplication](#deduplication)
11. [Configuration & Customization](#configuration--customization)
12. [Orchestration with Hatchet](#orchestration-with-hatchet)
13. [Deployment & Infrastructure](#deployment--infrastructure)
14. [Monitoring & Observability](#monitoring--observability)
15. [Local Development Workflow](#local-development-workflow)
16. [Integration Ecosystem](#integration-ecosystem)

---

## Core Architecture

### Technology Stack

R2R is built on a modern, production-ready technology stack:

- **Backend Framework**: Python-based RESTful API server
- **Database**: PostgreSQL with pgvector extension for vector operations
- **Embedding Provider**: LiteLLM (supports OpenAI, Anthropic, Azure, Ollama, etc.)
- **LLM Provider**: Configurable (OpenAI, Anthropic, Azure, local models via Ollama/LM Studio)
- **Orchestration**: Hatchet for distributed workflow management
- **Document Processing**: Unstructured.io integration (27+ file types)
- **Graph Database**: Built-in graph storage with PostgreSQL, optional Neo4j integration
- **Container Platform**: Docker/Docker Compose/Docker Swarm

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         R2R System                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   RESTful    │  │  Python SDK  │  │     JS SDK   │    │
│  │     API      │  │   (Sync/    │  │              │    │
│  │              │  │    Async)    │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│  ┌────────────────────────┴───────────────────────────┐   │
│  │           Core Processing Engine                   │   │
│  ├────────────────────────────────────────────────────┤   │
│  │  • Document Ingestion  • Chunking                  │   │
│  │  • Embedding Generation • Vector Search            │   │
│  │  • Graph Extraction     • Entity Resolution        │   │
│  │  • RAG Generation       • Agent Coordination       │   │
│  └────────────────────────┬───────────────────────────┘   │
│                           │                                │
│  ┌────────────────────────┴───────────────────────────┐   │
│  │            Storage & Orchestration Layer           │   │
│  ├────────────────────────────────────────────────────┤   │
│  │  PostgreSQL + pgvector  │  Hatchet Workflows      │   │
│  │  • Documents & Chunks   │  • Async Task Queue     │   │
│  │  • Vector Embeddings    │  • Workflow DAGs        │   │
│  │  • Knowledge Graphs     │  • Concurrency Control  │   │
│  │  • User Management      │  • Rate Limiting        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Layers

R2R uses a hierarchical configuration system:

1. **Server-side Configuration**: TOML-based (`r2r.toml`) defining system defaults
2. **Runtime Settings**: Dynamic overrides via API calls for per-request customization
3. **Environment Variables**: Secrets and deployment-specific settings

---

## Key Capabilities

### Production-Ready Features

- **Multi-Modal Content Support**: Text, PDF, images, audio (via Whisper), and video processing
- **User Management**: Authentication, authorization, and multi-tenancy support
- **Access Control**: Role-based permissions and collection-level security
- **Observability**: Built-in analytics, logging, and performance monitoring
- **Scalability**: Horizontal scaling via Docker Swarm, support for distributed deployments
- **Dashboard UI**: React + Next.js dashboard for system management (R2R-Application)

### Advanced RAG Techniques

- **Hybrid Search**: Combines vector similarity and keyword-based BM25 search
- **HyDE (Hypothetical Document Embeddings)**: Generates hypothetical documents to enhance retrieval
- **RAG-Fusion**: Merges results from multiple search iterations for improved quality
- **Knowledge Graph Search**: Multi-hop traversal and relationship-aware retrieval
- **Contextual Enrichment**: Adds contextual metadata to document chunks

---

## Document Management & Ingestion

### Ingestion Pipeline

R2R supports multiple ingestion modes optimized for different use cases:

#### Ingestion Modes

1. **Fast Mode**: Quick processing with basic parsing
2. **Hi-Res Mode**: High-resolution parsing with advanced ML models (via Unstructured API)
3. **Custom Mode**: User-defined chunking and processing strategies

#### Document Processing Flow

```
┌──────────────┐
│  Raw File    │
│ (PDF, DOCX,  │
│  TXT, etc.)  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  File Parsing    │  ← Unstructured.io integration
│  • Text Extract  │     (27+ file types)
│  • Layout Detect │
│  • OCR (if req.) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Chunking       │  ← Configurable strategies:
│  • Fixed size    │     • Character-based
│  • Semantic      │     • Token-based
│  • Paragraph    │     • Semantic boundaries
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Embedding      │  ← LiteLLM support for:
│   Generation     │     • OpenAI
│  • text-embed... │     • Azure OpenAI
│  • Ollama local  │     • Ollama/local models
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Vector Storage  │  ← PostgreSQL + pgvector
│  + Metadata      │     with full-text search
└──────────────────┘
```

### Supported File Types

Through Unstructured.io integration:
- **Documents**: PDF, DOCX, DOC, PPTX, XLSX, TXT, MD, RTF, ODT
- **Web**: HTML, XML, EML, MSG
- **Images**: JPG, PNG, TIFF (with OCR)
- **Code**: Source code files with syntax preservation
- **Audio**: MP3, WAV (transcription via Whisper)
- **Video**: MP4, AVI (frame extraction + transcription)

### Document API Operations

```python
from r2r import R2RClient

client = R2RClient("http://localhost:7272")

# Create document
response = client.documents.create(
    file_path="document.pdf",
    metadata={"source": "research", "category": "AI"},
    id=None  # Auto-generated UUID
)

# Update document
client.documents.update(
    id=document_id,
    metadata={"reviewed": True}
)

# Delete document
client.documents.delete(id=document_id)

# List documents with filters
docs = client.documents.list(
    filters={"category": {"$eq": "AI"}},
    limit=50,
    offset=0
)
```

### Asynchronous Ingestion

R2R processes ingestion asynchronously, allowing high-throughput document uploads:

```python
# Documents are ingested in the background
result = client.documents.create(file_path="large_file.pdf")

# Check ingestion status
docs = client.documents.list()
# Status: 'pending' → 'processing' → 'success' or 'failure'
```

---

## Collections System

### Overview

Collections are organizational containers in R2R that:
- Group related documents together
- Enable access control and permissions management
- Maintain unified knowledge graphs across documents
- Support multi-document relationships and deduplication

### Key Features

1. **Multi-Document Support**: A collection can contain unlimited documents
2. **Multi-Collection Membership**: A document can belong to multiple collections
3. **Access Control**: Collections enforce user-level and group-level permissions
4. **Graph Unification**: Collection-level graphs merge entities from all member documents
5. **Flexible Organization**: Use for projects, teams, topics, or any logical grouping

### Collection Lifecycle

```python
from r2r import R2RClient

client = R2RClient("http://localhost:7272")

# Create collection
collection = client.collections.create(
    name="AI Research Papers",
    description="Collection of ML and AI research documents",
    metadata={"department": "R&D"}
)

# Add documents to collection
client.collections.add_document(
    collection_id=collection_id,
    document_id=document_id
)

# List collections
collections = client.collections.list(
    offset=0,
    limit=100
)

# Retrieve collection with documents
details = client.collections.retrieve(
    id=collection_id,
    include_documents=True
)

# Remove document from collection
client.collections.remove_document(
    collection_id=collection_id,
    document_id=document_id
)

# Delete collection (does not delete documents)
client.collections.delete(id=collection_id)
```

### Access Control Integration

Collections integrate with R2R's user management system:

```python
# Private collection (owner only)
collection = client.collections.create(
    name="Private Notes",
    is_public=False
)

# Shared collection (specific users)
client.collections.share(
    collection_id=collection_id,
    user_ids=[user1_id, user2_id]
)

# Superuser access (all collections)
# Superusers can view and manage all collections
```

---

## Knowledge Graphs & GraphRAG

### Why Knowledge Graphs?

Traditional RAG systems struggle with:
1. **Complex Relationships**: Understanding how entities connect across documents
2. **Global Context**: Answering questions requiring dataset-wide knowledge
3. **Multi-Hop Reasoning**: Following chains of relationships

GraphRAG solves these by representing knowledge as an interconnected network of entities and relationships.

### Graph Architecture

R2R implements a two-level graph system:

#### 1. Document-Level Graphs

Individual documents undergo entity and relationship extraction:

```
┌─────────────────────────────────────────────────────┐
│              Document: "AI Research Paper"          │
├─────────────────────────────────────────────────────┤
│                                                     │
│   ┌──────────┐       ┌──────────┐                 │
│   │ DeepSeek │─────▶│   Model  │                 │
│   │   -R1    │       │          │                 │
│   └────┬─────┘       └──────────┘                 │
│        │                                            │
│        │ developed_by                               │
│        │                                            │
│   ┌────▼─────┐       ┌──────────┐                 │
│   │DeepSeek  │─────▶│   Org.   │                 │
│   │   -AI    │       │          │                 │
│   └──────────┘       └──────────┘                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 2. Collection-Level Graphs

Collections merge and deduplicate entities across documents:

```
┌─────────────────────────────────────────────────────────┐
│        Collection: "AI Research Collection"             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Doc1: "DeepSeek Paper"     Doc2: "Transformer Paper" │
│         │                              │                │
│         └──────────┬───────────────────┘                │
│                    │                                    │
│              ┌─────▼─────┐                              │
│              │ DeepSeek  │ (merged entity)              │
│              │   -AI     │                              │
│              └─────┬─────┘                              │
│                    │                                    │
│         ┌──────────┴──────────┐                         │
│         │                     │                         │
│    ┌────▼─────┐         ┌────▼─────┐                   │
│    │DeepSeek  │         │ OpenAI   │                   │
│    │   -R1    │         │  GPT-4   │                   │
│    └──────────┘         └──────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Entity Extraction Process

R2R uses advanced LLMs to extract structured knowledge:

```python
# Extract entities and relationships from document
extraction = client.documents.extract(
    document_id=document_id
)

# View extracted entities
entities = client.documents.list_entities(
    document_id=document_id
)

# Example entity structure:
# Entity(
#     name='DeepSeek-R1',
#     description='A reasoning model with RL training',
#     category='Model',
#     id=UUID('...'),
#     parent_id=document_id,
#     chunk_ids=[chunk1_id, chunk2_id]
# )

# View extracted relationships
relationships = client.documents.list_relationships(
    document_id=document_id
)

# Example relationship:
# Relationship(
#     subject='DeepSeek-R1',
#     predicate='developed_by',
#     object='DeepSeek-AI',
#     description='DeepSeek-R1 was developed by DeepSeek-AI',
#     weight=1.0
# )
```

### Building Collection Graphs

After extraction, entities are pulled into collection graphs:

```python
# Pull document entities into collection graph
client.graphs.build(
    collection_id=collection_id
)

# This process:
# 1. Gathers all entities from collection documents
# 2. Deduplicates entities across documents
# 3. Merges relationships
# 4. Generates embeddings for graph search
```

### Community Detection

R2R can identify higher-level concepts through community detection:

```python
# Build communities (clusters of related entities)
client.graphs.create_communities(
    collection_id=collection_id
)

# Communities group semantically related entities:
# Community "Machine Learning Models":
#   - GPT-4, Claude, DeepSeek-R1, Llama
# Community "Tech Companies":
#   - OpenAI, Anthropic, DeepSeek-AI, Meta
```

### Graph Search

Query the knowledge graph for relationship-aware retrieval:

```python
# Local graph search (starting from specific entity)
results = client.retrieval.search(
    query="What models did DeepSeek-AI develop?",
    graph_search_settings={
        "enabled": True,
        "search_type": "local",
        "max_hops": 2
    }
)

# Global graph search (community-level insights)
results = client.retrieval.search(
    query="Overview of AI model development landscape",
    graph_search_settings={
        "enabled": True,
        "search_type": "global"
    }
)
```

### Triplex Model Integration

R2R leverages the **Triplex Model** for cost-effective entity extraction:
- Open-source model specifically trained for knowledge graph extraction
- Runs locally without API costs
- Optimized for entity-relationship triplet extraction
- Significantly faster and cheaper than GPT-4 for graph tasks

---

## Retrieval & Search

### Search Modes

R2R supports three primary search paradigms:

#### 1. Vector Search (Semantic)

Semantic similarity search using embeddings:

```python
results = client.retrieval.search(
    query="machine learning model architectures",
    vector_search_settings={
        "use_semantic_search": True,
        "limit": 10,
        "filters": {"category": {"$eq": "AI"}}
    }
)
```

**How it works**:
1. Query is embedded using the same model as documents
2. Cosine similarity computed against all chunk embeddings
3. Top-K most similar chunks retrieved
4. Results ranked by similarity score

#### 2. Hybrid Search

Combines vector similarity with keyword matching (BM25):

```python
results = client.retrieval.search(
    query="transformer attention mechanism",
    vector_search_settings={
        "use_hybrid_search": True,
        "limit": 10,
        "hybrid_alpha": 0.7  # 0.7 semantic, 0.3 keyword
    }
)
```

**Benefits**:
- Captures both semantic meaning and exact keyword matches
- More robust against vocabulary mismatches
- Better for technical queries with specific terminology

#### 3. Knowledge Graph Search

Relationship-aware retrieval:

```python
results = client.retrieval.search(
    query="How are transformers and attention related?",
    graph_search_settings={
        "enabled": True,
        "search_type": "local",
        "max_hops": 2
    }
)
```

**Search Types**:
- **Local Search**: Starts from entities matching the query, traverses relationships
- **Global Search**: Uses community-level summaries for dataset-wide questions

### Search Filtering

R2R supports PostgreSQL-style operators for complex filtering:

```python
results = client.retrieval.search(
    query="deep learning",
    vector_search_settings={
        "filters": {
            "$and": [
                {"category": {"$eq": "AI"}},
                {"year": {"$gte": 2020}},
                {"author": {"$in": ["Hinton", "LeCun", "Bengio"]}}
            ]
        }
    }
)
```

**Supported Operators**:
- `$eq`, `$ne`: Equal, not equal
- `$gt`, `$gte`, `$lt`, `$lte`: Comparisons
- `$in`, `$nin`: Membership checks
- `$and`, `$or`: Logical combinations

---

## Advanced RAG Techniques

### HyDE (Hypothetical Document Embeddings)

**Problem**: Queries and documents often have different vocabulary and structure.

**Solution**: Generate a hypothetical answer, embed it, and search using that embedding.

```python
# Enable HyDE
results = client.retrieval.rag(
    query="Explain how transformers work",
    vector_search_settings={
        "search_strategy": "hyde"
    }
)
```

**HyDE Flow**:

```
┌──────────────────┐
│  User Query      │
│ "How do trans-   │
│  formers work?"  │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  LLM generates hypothetical answer:    │
│  "Transformers use self-attention      │
│   mechanisms to process sequences..."  │
└────────┬───────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Embed           │
│  hypothetical    │
│  answer          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Search vector   │
│  DB with hypo-   │
│  thetical embed  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Retrieve best   │
│  matching chunks │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate final  │
│  answer with     │
│  retrieved docs  │
└──────────────────┘
```

**Benefits**:
- Better semantic matching for complex queries
- Particularly effective in zero-shot scenarios
- Improves retrieval of relevant content that uses different terminology

### RAG-Fusion

**Problem**: Single search queries may miss relevant information.

**Solution**: Generate multiple query variations, search for each, and fuse results.

```python
# Enable RAG-Fusion
results = client.retrieval.rag(
    query="machine learning optimization techniques",
    vector_search_settings={
        "search_strategy": "rag_fusion"
    }
)
```

**RAG-Fusion Flow**:

```
┌──────────────────┐
│  Original Query  │
│ "ML optimization │
│  techniques"     │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Generate query variations:        │
│  1. "gradient descent methods"     │
│  2. "neural network training"      │
│  3. "optimization algorithms"      │
└────────┬───────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Search for each │
│  query variation │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Fuse results    │
│  using Recipro-  │
│  cal Rank Fusion │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate answer │
│  with fused      │
│  context         │
└──────────────────┘
```

**Benefits**:
- Captures multiple perspectives on the same question
- More comprehensive retrieval coverage
- Reduces impact of suboptimal query formulation

### Configuration Example

```python
# Compare vanilla RAG vs. advanced techniques
vanilla = client.retrieval.rag(
    query="What are transformers?",
    vector_search_settings={
        "search_strategy": "vanilla"
    }
)

hyde = client.retrieval.rag(
    query="What are transformers?",
    vector_search_settings={
        "search_strategy": "hyde"
    }
)

fusion = client.retrieval.rag(
    query="What are transformers?",
    vector_search_settings={
        "search_strategy": "rag_fusion"
    }
)
```

**Note**: Advanced RAG techniques are beta features and not yet fully integrated with agentic workflows.

---

## Agentic RAG

### Overview

**Agentic RAG** (also called Deep Research) extends basic retrieval with multi-step reasoning, tool usage, and autonomous decision-making. The agent can:
- Decide **when** and **what** to retrieve
- Chain multiple retrieval steps
- Invoke external tools (web search, Python execution, etc.)
- Reason over retrieved information before generating answers

### Operating Modes

#### RAG Mode (Default)

Standard retrieval-augmented generation:

```python
response = client.retrieval.agent(
    message="What are the latest developments in AI?",
    conversation_id=None,  # New conversation
    rag_generation_config={
        "model": "gpt-4",
        "temperature": 0.7
    }
)
```

**Available Tools**:
- `vector_search`: Semantic search over documents
- `graph_search`: Knowledge graph traversal
- `web_search`: External web search (Serper API)
- `web_scrape`: Extract content from URLs (Firecrawl)

#### Research Mode

Advanced mode with reasoning and computation:

```python
response = client.retrieval.agent(
    message="Analyze the performance trends of transformer models",
    mode="research",  # Enable research mode
    conversation_id=conversation_id
)
```

**Additional Tools**:
- `reasoning`: Multi-step reasoning for complex problems
- `critique`: Identify biases and logical fallacies
- `python_exec`: Execute Python code for computations

### Tool Configuration

Configure which tools are available to the agent:

```toml
# r2r.toml
[agent]
system_instruction = "You are a helpful AI assistant..."
tool_names = [
    "vector_search",
    "graph_search",
    "web_search"
]

[agent.generation_config]
model = "gpt-4"
temperature = 0.7
```

**Environment Variables for Tools**:

```bash
# Web search (Serper)
export SERPER_API_KEY=your_serper_key

# Web scraping (Firecrawl)
export FIRECRAWL_API_KEY=your_firecrawl_key
```

### Multi-Step Agent Workflow

Example of agent reasoning process:

```
User: "Compare the architectures of GPT-4 and Claude"

Agent Thought Process:
┌─────────────────────────────────────────┐
│ Step 1: Gather information about GPT-4  │
│ Tool: vector_search("GPT-4 architecture") │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Step 2: Gather information about Claude │
│ Tool: vector_search("Claude architecture") │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Step 3: Check for recent updates        │
│ Tool: web_search("GPT-4 vs Claude 2024") │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Step 4: Synthesize comparison           │
│ Generate comprehensive comparison       │
└─────────────────────────────────────────┘
```

### Conversation Integration

Agents maintain context across multiple turns:

```python
# Start a conversation
response1 = client.retrieval.agent(
    message="What are transformers?",
    conversation_id=None  # Creates new conversation
)

conversation_id = response1['conversation_id']

# Continue the conversation
response2 = client.retrieval.agent(
    message="How do they differ from RNNs?",
    conversation_id=conversation_id  # References previous context
)

# Agent automatically includes conversation history in context
```

---

## Conversations & Context Management

### Overview

Conversations in R2R enable:
- **Multi-turn dialogue**: Persistent context across interactions
- **Message threading**: Parent-child relationships for branching discussions
- **Context preservation**: Automatic maintenance of conversation history
- **User association**: Private and shared conversation support

### Conversation Structure

```
Conversation
│
├── Message 1 (User)
│   │
│   └── Message 2 (Assistant)
│       │
│       ├── Message 3 (User) [Branch A]
│       │   │
│       │   └── Message 4 (Assistant)
│       │
│       └── Message 5 (User) [Branch B]
│           │
│           └── Message 6 (Assistant)
```

### Conversation Management

```python
from r2r import R2RClient

client = R2RClient()

# Create conversation
conversation = client.conversations.create(
    name="AI Research Discussion",
    description="Discussion about transformer models"
)

# Add messages
message1 = client.conversations.add_message(
    conversation_id=conversation.id,
    content="What are the key innovations in transformers?",
    role="user"
)

message2 = client.conversations.add_message(
    conversation_id=conversation.id,
    content="The key innovations include self-attention...",
    role="assistant",
    parent_id=message1.id
)

# Update message
client.conversations.update_message(
    conversation_id=conversation.id,
    message_id=message1.id,
    content="What are the key innovations in transformer models?",
    metadata={"edited": True}
)

# List conversations
conversations = client.conversations.list(
    offset=0,
    limit=50
)

# Get conversation details
details = client.conversations.get(
    conversation_id=conversation.id
)

# List branches
branches = client.conversations.list_branches(
    conversation_id=conversation.id
)

# Delete conversation
client.conversations.delete(
    conversation_id=conversation.id
)
```

### Message Threading

Messages can reference parent messages, enabling branching discussions:

```python
# Original thread
msg1 = client.conversations.add_message(
    conversation_id=conv_id,
    content="Explain transformers",
    role="user"
)

response = client.conversations.add_message(
    conversation_id=conv_id,
    content="Transformers use self-attention...",
    role="assistant",
    parent_id=msg1.id
)

# Branch A: Follow-up on attention
branch_a = client.conversations.add_message(
    conversation_id=conv_id,
    content="Tell me more about self-attention",
    role="user",
    parent_id=response.id
)

# Branch B: Different direction
branch_b = client.conversations.add_message(
    conversation_id=conv_id,
    content="What about positional encoding?",
    role="user",
    parent_id=response.id
)
```

### Integration with Agentic RAG

Conversations seamlessly integrate with agentic workflows:

```python
# Agent automatically uses conversation history
response = client.retrieval.agent(
    message="What did we discuss earlier about attention?",
    conversation_id=conversation_id
)

# Agent has access to:
# - All previous messages in conversation
# - Branching history
# - Metadata and context
```

### Access Control

Conversations support private and shared access:

```python
# Private conversation (owner only)
conv = client.conversations.create(
    name="Private Notes",
    is_private=True
)

# Share conversation with specific users
client.conversations.share(
    conversation_id=conv.id,
    user_ids=[user1_id, user2_id]
)

# Superuser access
# Superusers can view/manage all conversations
```

---

## Deduplication

### Problem Statement

During graph extraction, the same entity often appears in multiple chunks with slight variations:

**Example from "The Gift of the Magi"**:

| Entity Name | Occurrences |
|-------------|-------------|
| Magi | 15 |
| Della | 15 |
| Jim | 15 |
| O. Henry | 11 |
| Christmas | 8 |

**Total**: 129 entities → **20 unique** entities

Duplicates create:
- Noisy knowledge graphs
- Redundant embeddings
- Suboptimal search results
- Increased storage costs

### Solution: Entity Deduplication

R2R provides **document-level deduplication** (graph-level deduplication planned):

```python
# Deduplicate entities in a document
client.documents.deduplicate(
    document_id="20e29a97-c53c-506d-b89c-1f5346befc58"
)
```

### Deduplication Process

```
┌─────────────────────────────────────────────────┐
│ Step 1: Identify Duplicate Candidates          │
│  • String similarity matching                   │
│  • Configurable threshold                       │
│  • Category-aware matching                      │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ Step 2: Merge Duplicate Entities                │
│  • Combine descriptions                         │
│  • Aggregate metadata                           │
│  • Consolidate chunk references                 │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ Step 3: Regenerate Entity Description           │
│  • Use LLM to create merged description         │
│  • Preserve source information                  │
│  • Generate new embedding                       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ Step 4: Update Relationships                    │
│  • Redirect all relationships to merged entity  │
│  • Remove duplicate entity records              │
│  • Update chunk-entity mappings                 │
└─────────────────────────────────────────────────┘
```

### Results

After deduplication:

| Entity Name | Count (Before) | Count (After) |
|-------------|----------------|---------------|
| Magi | 15 | 1 |
| Della | 15 | 1 |
| Jim | 15 | 1 |
| O. Henry | 11 | 1 |
| Christmas | 8 | 1 |

**Graph Quality**:
- ✅ Cleaner entity nodes
- ✅ More accurate relationship mapping
- ✅ Better search results
- ✅ Reduced storage overhead

### Configuration

Configure deduplication behavior in `r2r.toml`:

```toml
[deduplication]
# Similarity threshold for matching (0-1)
similarity_threshold = 0.85

# Matching strategy
matching_strategy = "string_similarity"  # or "embedding_similarity"

# Category-aware matching
match_within_categories = true
```

### Future: Graph-Level Deduplication

Planned features:
- Cross-document entity deduplication at collection level
- Canonical entity resolution
- Automated entity linking across graphs

---

## Configuration & Customization

### Configuration Architecture

R2R uses a **TOML-based** configuration system with override capabilities:

```
┌─────────────────────────────────────────────┐
│         Configuration Hierarchy             │
├─────────────────────────────────────────────┤
│  1. Default Config (r2r.toml)               │
│     ↓ Override                              │
│  2. Custom Config (my_r2r.toml)             │
│     ↓ Override                              │
│  3. Environment Variables                   │
│     ↓ Override                              │
│  4. Runtime API Parameters                  │
└─────────────────────────────────────────────┘
```

### Pre-defined Configurations

R2R ships with multiple pre-configured profiles:

| Config File | Description |
|-------------|-------------|
| `r2r.toml` | Default configuration (OpenAI) |
| `full.toml` | Full stack with Hatchet orchestration |
| `full_azure.toml` | Azure OpenAI + Hatchet |
| `full_ollama.toml` | Local Ollama models + Hatchet |
| `full_lm_studio.toml` | LM Studio + Hatchet |
| `ollama.toml` | Ollama without orchestration |
| `gemini.toml` | Google Gemini models |
| `r2r_with_auth.toml` | Authentication required |
| `tavily.toml` | Tavily web search integration |

### Custom Configuration

Create a custom config file:

```toml
# my_r2r.toml

[app]
# LLM models
fast_llm = "gpt-3.5-turbo"      # Quick operations
quality_llm = "gpt-4"            # User-facing responses
vlm = "gpt-4o"                   # Vision/multimodal tasks

[database]
provider = "postgres"
user = "postgres"
password = "postgres"
host = "localhost"
port = 5432
db_name = "r2r"
project_name = "r2r_default"

[embedding]
provider = "litellm"
base_model = "text-embedding-3-large"
base_dimension = 3072
batch_size = 128

[chunking]
provider = "unstructured_local"
strategy = "auto"
chunking_strategy = "by_title"
max_characters = 512
combine_under_n_chars = 128
overlap = 50

[completion]
provider = "litellm"
concurrent_request_limit = 16

[agent]
system_instruction = "You are a helpful AI assistant with access to a knowledge base."
tool_names = ["vector_search", "graph_search", "web_search"]

[agent.generation_config]
model = "gpt-4"
temperature = 0.7
top_p = 1.0
max_tokens_to_sample = 2048
stream = true

[orchestration]
provider = "hatchet"  # or "simple" for testing
```

### Environment Variables

Key environment variables for R2R:

```bash
# Configuration Selection
R2R_CONFIG_NAME=full              # Use predefined config
# OR
R2R_CONFIG_PATH=/path/to/my_r2r.toml  # Use custom config

# LLM Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
AZURE_API_KEY=...
AZURE_API_BASE=https://...
AZURE_API_VERSION=2023-05-15
XAI_API_KEY=...                   # For GROK models

# Ollama Configuration
OLLAMA_API_BASE=http://localhost:11434

# Agent Tools
SERPER_API_KEY=...                # Web search
FIRECRAWL_API_KEY=...             # Web scraping

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DBNAME=r2r

# Authentication (optional)
R2R_SECRET_KEY=your_secret_key
R2R_REQUIRE_EMAIL_VERIFICATION=false
```

### Runtime Configuration

Override settings at request time:

```python
# Override LLM model for specific request
response = client.retrieval.rag(
    query="What are transformers?",
    rag_generation_config={
        "model": "claude-3-opus-20240229",  # Override default
        "temperature": 0.5,
        "max_tokens_to_sample": 1024
    }
)

# Override search settings
results = client.retrieval.search(
    query="machine learning",
    vector_search_settings={
        "limit": 50,                        # Override default limit
        "use_hybrid_search": True,
        "filters": {"category": {"$eq": "AI"}}
    }
)
```

### Complete Configuration Reference

For all configurable parameters, see:
https://github.com/SciPhi-AI/R2R/blob/main/py/core/configs/all_possible_config.toml

---

## Orchestration with Hatchet

### Why Orchestration?

Production RAG systems require:
- **Asynchronous Processing**: Long-running ingestion and graph extraction
- **Workflow Management**: Multi-step pipelines with dependencies
- **Concurrency Control**: Limit concurrent operations to avoid overload
- **Fault Tolerance**: Retry failed tasks and handle errors gracefully
- **Scalability**: Distribute work across multiple workers

### Hatchet Integration

R2R integrates with **[Hatchet](https://hatchet.run/)**, an open-source workflow orchestration engine:

```toml
# full.toml
[orchestration]
provider = "hatchet"
```

### Orchestration Modes

#### Simple (Synchronous)

For testing and development only:

```toml
[orchestration]
provider = "simple"
```

⚠️ **Not recommended for production** - blocks until tasks complete.

#### Hatchet (Production)

For production deployments:

```toml
[orchestration]
provider = "hatchet"
```

### Starting R2R with Hatchet

```bash
# Docker Compose with Hatchet
cd R2R/docker
COMPOSE_PROFILES=postgres docker compose -f compose.full.yaml up -d

# Hatchet dashboard available at:
# http://localhost:7274
# Default credentials:
#   Email: admin@example.com
#   Password: Admin123!!
```

### Hatchet Dashboard

The Hatchet dashboard provides:

- **Workflow Visualization**: View workflow DAGs and execution status
- **Task Monitoring**: Track running, completed, and failed tasks
- **Performance Metrics**: Execution times, throughput, error rates
- **Retry Management**: Manually retry failed tasks
- **Worker Health**: Monitor worker status and capacity

### Workflow Orchestration Features

#### Declarative Workflows (DAGs)

Define task dependencies upfront:

```python
# Example: Document ingestion workflow
workflow = {
    "parse_file": {
        "depends_on": []
    },
    "chunk_document": {
        "depends_on": ["parse_file"]
    },
    "generate_embeddings": {
        "depends_on": ["chunk_document"]
    },
    "extract_entities": {
        "depends_on": ["chunk_document"]
    },
    "store_vectors": {
        "depends_on": ["generate_embeddings"]
    },
    "build_graph": {
        "depends_on": ["extract_entities", "store_vectors"]
    }
}
```

#### Procedural Workflows (Child Spawning)

Dynamically spawn tasks based on runtime conditions:

```python
# Example: Process each chunk independently
for chunk in chunks:
    spawn_task("embed_chunk", chunk_id=chunk.id)
```

### Flow Control Primitives

#### Worker Slots

Control concurrent task execution per worker:

```yaml
# Worker configuration
worker:
  max_slots: 10  # Max concurrent tasks per worker
```

#### Concurrency Control

Global limits on concurrent execution:

```python
# Limit concurrent ingestion tasks
@workflow(concurrency_key="document_ingestion", max_concurrency=5)
def ingest_document(document_id):
    # Only 5 ingestion tasks run concurrently across all workers
    pass
```

#### Rate Limiting

Control task execution rate:

```python
# Limit to 100 embedding requests per minute
@workflow(rate_limit="100/minute")
def generate_embeddings(chunks):
    pass
```

### Orchestrated Workflows in R2R

R2R automatically orchestrates these workflows through Hatchet:

1. **Document Ingestion**:
   - Parse file
   - Chunk content
   - Generate embeddings (batched)
   - Store in database

2. **Graph Construction**:
   - Extract entities (parallel per document)
   - Extract relationships
   - Build collection graph
   - Deduplicate entities
   - Create communities

3. **Search**:
   - Parallel vector + keyword search (hybrid)
   - Aggregate results
   - Rerank

### Monitoring Workflows

```bash
# View workflow logs
docker logs hatchet-engine

# Check worker status
curl http://localhost:7274/api/v1/workers

# View workflow runs
curl http://localhost:7274/api/v1/workflows
```

---

## Deployment & Infrastructure

### Deployment Options

R2R supports multiple deployment strategies:

#### 1. Local Development

Quick start for development and testing:

```bash
pip install r2r
r2r serve --docker
```

Access at: `http://localhost:7272`

#### 2. Docker Compose (Single Host)

Recommended for small to medium organizations:

```bash
git clone https://github.com/SciPhi-AI/R2R.git
cd R2R/docker

# Configure environment
cd env
nano r2r-full.env  # Add API keys

# Start services
cd ..
COMPOSE_PROFILES=postgres docker compose -f compose.full.yaml up -d
```

**Services**:
- R2R API Server (port 7272)
- PostgreSQL + pgvector (port 5432)
- Hatchet Engine (port 7274)

#### 3. Docker Swarm (Multi-Host)

For horizontal scaling across multiple nodes:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c compose.full.swarm.yaml r2r

# Scale services
docker service scale r2r_api=5
```

#### 4. Kubernetes

For enterprise deployments:

```bash
cd deployment/k8s

# Apply configurations
kubectl apply -f namespace.yaml
kubectl apply -f postgres.yaml
kubectl apply -f r2r-deployment.yaml
kubectl apply -f r2r-service.yaml
kubectl apply -f hatchet-deployment.yaml
```

#### 5. Cloud Providers

Detailed guides for:
- **AWS**: EC2 with EBS volumes
- **Azure**: VM with managed PostgreSQL
- **GCP**: Compute Engine with Cloud SQL
- **SciPhi Cloud**: Managed R2R hosting

See: https://r2r-docs.sciphi.ai/self-hosting/deployment/overview

### Resource Requirements

**Minimum**:
- 4 vCPU cores
- 8GB RAM
- 50GB + (4× raw data size) disk space

**Recommended (Production)**:
- 8+ vCPU cores
- 16GB+ RAM
- SSD storage
- Dedicated PostgreSQL instance

### High Availability Setup

For production high availability:

```yaml
# docker-compose.ha.yaml
services:
  r2r-api:
    image: sciphi/r2r:latest
    replicas: 3
    deploy:
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
  
  postgres:
    image: pgvector/pgvector:pg16
    volumes:
      - postgres-data:/var/lib/postgresql/data
    deploy:
      placement:
        constraints: [node.role == manager]
  
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - r2r-api
```

### Network Configuration

**Firewall Rules**:
- Port 7272: R2R API (HTTPS recommended in production)
- Port 7274: Hatchet Dashboard (restrict to admin IPs)
- Port 5432: PostgreSQL (internal only, no public access)

**SSL/TLS**:
Use a reverse proxy (Nginx, Traefik, Caddy) for HTTPS:

```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    location / {
        proxy_pass http://r2r-api:7272;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backup & Recovery

**Database Backups**:

```bash
# Automated PostgreSQL backup
docker exec postgres pg_dump -U postgres r2r > backup.sql

# Schedule with cron
0 2 * * * docker exec postgres pg_dump -U postgres r2r > /backups/r2r_$(date +\%Y\%m\%d).sql
```

**Restore**:

```bash
docker exec -i postgres psql -U postgres r2r < backup.sql
```

---

## Monitoring & Observability

### Built-in Analytics

R2R includes native observability features:

#### Health Checks

```bash
# System health
curl http://localhost:7272/v3/health

# Response:
{
  "status": "healthy",
  "services": {
    "api": "ok",
    "database": "ok",
    "orchestration": "ok"
  }
}
```

#### Usage Analytics

Track system usage through the API:

```python
# Get analytics
stats = client.analytics.get_usage_stats(
    start_date="2024-01-01",
    end_date="2024-12-31"
)

# Response includes:
# - Total documents ingested
# - Number of searches
# - RAG completions
# - Agent interactions
# - Average response times
```

### Logging

R2R provides structured logging:

```python
# Configure logging level
import logging
logging.basicConfig(level=logging.INFO)

# Log locations (Docker):
# - API logs: docker logs r2r-api
# - Postgres logs: docker logs postgres
# - Hatchet logs: docker logs hatchet-engine
```

### Performance Monitoring

#### Request Tracing

Each API request includes timing information:

```json
{
  "results": [...],
  "metadata": {
    "latency_ms": 234,
    "breakdown": {
      "retrieval": 120,
      "generation": 114
    }
  }
}
```

#### Metrics Export

Export metrics to monitoring systems:

```bash
# Prometheus metrics endpoint
curl http://localhost:7272/metrics

# Example metrics:
# r2r_requests_total
# r2r_request_duration_seconds
# r2r_documents_ingested_total
# r2r_search_latency_seconds
```

### Hatchet Dashboard

Monitor workflow orchestration at `http://localhost:7274`:

- **Active Workflows**: Real-time workflow execution
- **Task Queues**: Pending, running, completed tasks
- **Failure Rates**: Identify problematic workflows
- **Performance**: Task execution times and throughput

### Integration with Observability Platforms

#### Grafana + Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'r2r'
    static_configs:
      - targets: ['r2r-api:7272']
```

#### Datadog

```bash
# Datadog agent configuration
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=<key> DD_SITE="datadoghq.com" \
  bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

#### Custom Logging

Integrate with external logging systems:

```python
# Custom log handler
import logging
from r2r import R2RClient

handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
logger = logging.getLogger('r2r')
logger.addHandler(handler)
```

### Error Tracking

R2R provides detailed error information:

```python
try:
    result = client.documents.create(file_path="document.pdf")
except Exception as e:
    print(f"Error: {e}")
    print(f"Request ID: {e.request_id}")
    print(f"Traceback: {e.traceback}")
```

---

## Local Development Workflow

### Setting Up Development Environment

#### Prerequisites

```bash
# Install Python 3.10+
python --version

# Install Docker
docker --version

# Install Git
git --version
```

#### Clone and Setup

```bash
# Clone repository
git clone https://github.com/SciPhi-AI/R2R.git
cd R2R

# Install Python package in development mode
cd py
pip install -e ".[dev]"

# Or install just the SDK
pip install r2r
```

### Running R2R Locally

#### Option 1: Docker (Recommended)

```bash
# Start R2R with Docker
r2r serve --docker

# Or use Docker Compose
cd docker
docker compose -f compose.full.yaml --profile postgres up -d
```

#### Option 2: Local Build

```bash
# Install dependencies
pip install -e ".[all]"

# Start PostgreSQL separately
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  pgvector/pgvector:pg16

# Start R2R server
r2r serve

# Server runs at http://localhost:7272
```

### Development with Custom Config

```bash
# Create custom config
cat > my_dev_config.toml << EOF
[app]
fast_llm = "gpt-3.5-turbo"
quality_llm = "gpt-4"

[database]
host = "localhost"
port = 5432

[orchestration]
provider = "simple"  # No Hatchet for local dev
EOF

# Start with custom config
export R2R_CONFIG_PATH=$(pwd)/my_dev_config.toml
r2r serve
```

### Testing the Installation

```bash
# Health check
curl http://localhost:7272/v3/health

# Ingest sample document
curl -X POST http://localhost:7272/v3/documents/create-sample

# Wait for ingestion
sleep 10

# Search
curl -X POST http://localhost:7272/v3/retrieval/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning"}'
```

### Python SDK Development

```python
from r2r import R2RClient

# Connect to local instance
client = R2RClient("http://localhost:7272")

# Test document ingestion
response = client.documents.create(
    file_path="test.pdf",
    metadata={"source": "test"}
)
print(f"Document ID: {response['document_id']}")

# Test search
results = client.retrieval.search(
    query="test query"
)
print(f"Found {len(results['results'])} results")

# Test RAG
rag_response = client.retrieval.rag(
    query="What is in the document?"
)
print(rag_response['results'])
```

### Debugging

#### Enable Debug Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)

from r2r import R2RClient
client = R2RClient("http://localhost:7272")
```

#### Check Logs

```bash
# Docker logs
docker logs r2r-api
docker logs postgres
docker logs hatchet-engine

# Local server logs
# Logs output to stdout by default
```

#### Database Inspection

```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d r2r

# View tables
\dt

# Inspect documents
SELECT id, metadata FROM documents LIMIT 10;

# View chunks
SELECT document_id, text FROM chunks LIMIT 5;

# Check entities
SELECT name, category, description FROM entities LIMIT 10;
```

### Hot Reloading

For rapid development, use auto-reload:

```bash
# Install watchdog
pip install watchdog

# Run with auto-reload
watchmedo auto-restart --directory=. --pattern=*.py --recursive \
  -- python -m r2r.server
```

### Testing Changes

```bash
# Run unit tests
cd py
pytest tests/

# Run integration tests
pytest tests/integration/

# Run specific test
pytest tests/test_ingestion.py -v
```

---

## Integration Ecosystem

### LLM Providers (via LiteLLM)

R2R supports 100+ LLM providers through LiteLLM:

- **OpenAI**: GPT-4, GPT-3.5, o1, text-embedding-3-*
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Azure OpenAI**: All Azure-hosted models
- **Google**: Gemini, PaLM
- **Cohere**: Command, Embed
- **Hugging Face**: Any hosted model
- **Ollama**: Local models (Llama, Mistral, etc.)
- **LM Studio**: Self-hosted models
- **vLLM**: High-performance serving
- **XAI**: GROK models

Configuration:

```toml
[completion]
provider = "litellm"

[app]
quality_llm = "gpt-4"  # OpenAI
# quality_llm = "anthropic/claude-3-opus-20240229"  # Anthropic
# quality_llm = "azure/gpt-4"  # Azure
# quality_llm = "ollama/llama3"  # Local
```

### Document Processing

#### Unstructured.io

```bash
# Local library
pip install unstructured

# Or use Serverless API
export UNSTRUCTURED_API_KEY=your_key

# Configure in r2r.toml
[chunking]
provider = "unstructured_api"
api_key = "${UNSTRUCTURED_API_KEY}"
```

#### Custom Parsers

Implement custom document parsers:

```python
from r2r.core import DocumentParser

class MyCustomParser(DocumentParser):
    def parse(self, file_path: str) -> str:
        # Custom parsing logic
        return extracted_text
```

### Vector Databases

R2R uses PostgreSQL + pgvector by default, but supports:

- **pgvector**: Production-ready, integrated with PostgreSQL
- **Neo4j**: For advanced graph operations (optional)
- **Custom**: Implement custom vector storage backends

### Web Tools

#### Serper (Web Search)

```bash
export SERPER_API_KEY=your_key

# Configure in agent tools
[agent]
tool_names = ["vector_search", "web_search"]
```

#### Firecrawl (Web Scraping)

```bash
export FIRECRAWL_API_KEY=your_key

[agent]
tool_names = ["vector_search", "web_scrape"]
```

#### Tavily (Alternative Search)

```bash
export TAVILY_API_KEY=your_key

# Use tavily.toml config
R2R_CONFIG_NAME=tavily r2r serve --docker
```

### Authentication Providers

#### JWT Authentication

```toml
[auth]
provider = "jwt"
secret_key = "${R2R_SECRET_KEY}"
algorithm = "HS256"
```

#### OAuth (Planned)

Future support for:
- Google OAuth
- Microsoft Azure AD
- GitHub OAuth

### Message Queue Integration

#### Hatchet

Default orchestration engine:

```toml
[orchestration]
provider = "hatchet"
```

#### Custom Queue Systems

Implement custom orchestration:

```python
from r2r.core import OrchestrationProvider

class MyQueueProvider(OrchestrationProvider):
    def enqueue_task(self, task_name: str, payload: dict):
        # Custom queue logic
        pass
```

### Monitoring Integrations

- **Prometheus**: Metrics export
- **Grafana**: Visualization
- **Datadog**: APM and logging
- **Sentry**: Error tracking
- **Elastic**: Log aggregation

### SDKs and Client Libraries

- **Python SDK**: `pip install r2r`
- **JavaScript/TypeScript SDK**: `npm install r2r-js`
- **CLI**: `pip install r2r-cli`
- **REST API**: Direct HTTP calls

---

## Best Practices

### Document Ingestion

1. **Batch Processing**: Ingest multiple documents concurrently for better throughput
2. **Metadata Strategy**: Include rich metadata for filtering and organization
3. **Chunking Strategy**: Choose chunking parameters based on document type
4. **Async Monitoring**: Monitor ingestion status for large batches

### Knowledge Graphs

1. **Extraction Quality**: Use high-quality LLMs (GPT-4) for entity extraction
2. **Deduplication**: Always run deduplication after extraction
3. **Community Detection**: Build communities for global search capabilities
4. **Incremental Updates**: Extract entities as documents are added

### Search Optimization

1. **Hybrid Search**: Use hybrid search for production workloads
2. **Filters**: Leverage metadata filters to narrow search scope
3. **Graph Search**: Enable graph search for relationship-heavy queries
4. **Result Limits**: Tune result limits based on latency requirements

### Agentic RAG

1. **Tool Selection**: Only enable tools your use case requires
2. **Conversation Context**: Use conversation IDs for multi-turn interactions
3. **Timeout Management**: Set appropriate timeouts for agent operations
4. **Error Handling**: Implement robust error handling for tool failures

### Configuration Management

1. **Environment Variables**: Store secrets in environment variables, not config files
2. **Version Control**: Track config changes in Git (exclude secrets)
3. **Environment-Specific**: Use different configs for dev/staging/prod
4. **Runtime Overrides**: Use runtime settings for user-specific customization

### Deployment

1. **Resource Planning**: Size infrastructure based on expected load
2. **Horizontal Scaling**: Use Docker Swarm or Kubernetes for scaling
3. **Monitoring**: Set up comprehensive monitoring from day one
4. **Backups**: Implement automated database backups
5. **SSL/TLS**: Always use HTTPS in production

### Security

1. **API Keys**: Rotate API keys regularly
2. **Access Control**: Implement role-based access control
3. **Network Security**: Restrict database access to internal networks
4. **Input Validation**: Validate all user inputs
5. **Rate Limiting**: Implement rate limiting at the API gateway level

---

## Troubleshooting

### Common Issues

#### 1. Connection Errors

```bash
# Check service health
curl http://localhost:7272/v3/health

# Verify Docker containers
docker ps

# Check logs
docker logs r2r-api
docker logs postgres
```

#### 2. Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory

# Or in docker-compose.yaml:
services:
  r2r-api:
    deploy:
      resources:
        limits:
          memory: 8G
```

#### 3. Slow Ingestion

```toml
# Increase concurrency in r2r.toml
[completion]
concurrent_request_limit = 32

# Use batched embedding generation
[embedding]
batch_size = 256
```

#### 4. Graph Extraction Failures

```bash
# Check LLM provider status
curl https://api.openai.com/v1/models

# Verify API key
echo $OPENAI_API_KEY

# Check extraction logs
docker logs r2r-api | grep "extraction"
```

#### 5. Search Returning No Results

```python
# Check document status
docs = client.documents.list()
for doc in docs['results']:
    print(f"{doc['id']}: {doc['status']}")

# Verify embeddings were generated
chunks = client.chunks.list(document_id=doc_id)
print(f"Chunks: {len(chunks['results'])}")
```

### Getting Help

- **Documentation**: https://r2r-docs.sciphi.ai
- **GitHub Issues**: https://github.com/SciPhi-AI/R2R/issues
- **Discord**: [SciPhi Discord Community]
- **Email**: founders@sciphi.ai

---

## Roadmap & Future Features

### Planned Features

- **Graph-Level Deduplication**: Cross-document entity resolution
- **Advanced Analytics**: Enhanced observability and performance insights
- **Multi-Modal Search**: Image and audio similarity search
- **Federated Search**: Search across multiple R2R instances
- **Enhanced Agents**: More sophisticated reasoning capabilities
- **OAuth Integration**: Social login providers
- **Real-Time Ingestion**: Streaming document updates
- **Advanced Caching**: Intelligent result caching

### Community Contributions

R2R is open-source (MIT License) and welcomes contributions:

- Feature requests via GitHub Issues
- Pull requests for bug fixes and enhancements
- Documentation improvements
- Community plugins and integrations

---

## Conclusion

R2R (RAG to Riches) represents a comprehensive, production-ready platform for building advanced RAG applications. Its combination of:

- **Robust document processing** (27+ file types)
- **Knowledge graphs** (GraphRAG with deduplication)
- **Advanced retrieval** (hybrid search, HyDE, RAG-Fusion)
- **Agentic capabilities** (multi-step reasoning, tool usage)
- **Enterprise features** (authentication, observability, orchestration)
- **Flexible deployment** (local, Docker, Kubernetes, cloud)

...makes it an ideal choice for organizations looking to deploy AI-powered retrieval systems at scale.

Whether you're building a simple document Q&A system or a complex multi-agent research platform, R2R provides the infrastructure, tools, and flexibility to bring your vision to production.

---

## Quick Start Checklist

```bash
# ✅ Install R2R
pip install r2r

# ✅ Set API keys
export OPENAI_API_KEY=sk-...

# ✅ Start R2R
r2r serve --docker

# ✅ Ingest documents
r2r documents create --file-paths document.pdf

# ✅ Search
r2r retrieval search --query "your question"

# ✅ RAG
r2r retrieval rag --query "explain this document"

# ✅ Build graph
r2r graphs build

# ✅ Agent interaction
r2r retrieval agent --message "research this topic"
```

**You're now ready to build production RAG applications with R2R!**

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Based on R2R v3.6.x*  
*For latest updates, visit: https://r2r-docs.sciphi.ai*
