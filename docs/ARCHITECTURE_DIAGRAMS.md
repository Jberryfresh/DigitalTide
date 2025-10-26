# DigitalTide - System Architecture Diagrams

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Consumer Web Platform]
        B[Admin Control Center]
        C[Mobile PWA]
    end
    
    subgraph "API Gateway"
        D[API Gateway<br/>Rate Limiting, Auth, Load Balancing]
    end
    
    subgraph "Core Services"
        E[Content API Service]
        F[User API Service]
        G[Analytics Service]
        H[Authentication Service]
    end
    
    subgraph "AI Agent Network"
        I[COO Orchestrator Agent]
        J[Content Director Agent]
        K[IT/Security Director Agent]
        L[Crawler Agent]
        M[Research Agent]
        N[Writer Agent]
        O[Quality Control Agent]
        P[SEO Agent]
        Q[Publisher Agent]
        R[Analytics Agent]
    end
    
    subgraph "Message Queue System"
        S[Redis Task Queues]
        T[WebSocket Manager]
    end
    
    subgraph "Data Layer"
        U[PostgreSQL<br/>Articles, Users, Analytics]
        V[Redis Cache<br/>Sessions, Temp Data]
        W[Vector Database<br/>Content Similarity]
        X[Elasticsearch<br/>Full-text Search]
    end
    
    subgraph "External Services"
        Y[News APIs<br/>Google News, NewsAPI]
        Z[AI Services<br/>OpenAI, Anthropic]
        AA[CDN<br/>CloudFlare]
        BB[Payment<br/>Stripe]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    
    E --> S
    F --> S
    G --> S
    
    I --> J
    I --> K
    J --> L
    J --> M
    J --> N
    J --> O
    J --> P
    J --> Q
    J --> R
    
    L --> S
    M --> S
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S
    
    S --> U
    S --> V
    S --> W
    S --> X
    
    L --> Y
    N --> Z
    M --> Z
    A --> AA
    F --> BB
    
    T --> A
    T --> B
```

## AI Agent Communication Flow

```mermaid
sequenceDiagram
    participant CEO as Human CEO
    participant COO as COO Agent
    participant CD as Content Director
    participant CR as Crawler Agent
    participant RE as Research Agent
    participant WR as Writer Agent
    participant QC as Quality Control Agent
    participant PU as Publisher Agent
    
    CEO->>COO: "Generate article about AI trends"
    COO->>CD: Delegate content creation task
    CD->>CR: Find trending AI topics
    CR->>CD: Return trending topics list
    CD->>RE: Research selected topics
    RE->>CD: Return research data
    CD->>WR: Generate article with research
    WR->>CD: Return draft article
    CD->>QC: Review article quality
    
    alt Article Approved
        QC->>CD: Approval with quality score
        CD->>PU: Publish approved article
        PU->>CD: Confirmation of publication
        CD->>COO: Report task completion
        COO->>CEO: "Article published successfully"
    else Article Needs Revision
        QC->>CD: Rejection with feedback
        CD->>WR: Revise article with feedback
        WR->>CD: Return revised article
    end
```

## Content Creation Pipeline

```mermaid
flowchart LR
    subgraph "Discovery Phase"
        A[News Sources] --> B[Crawler Agent]
        B --> C[Trending Topics DB]
    end
    
    subgraph "Research Phase"
        C --> D[Research Agent]
        D --> E[External Sources]
        E --> D
        D --> F[Fact Verification DB]
    end
    
    subgraph "Creation Phase"
        F --> G[Writer Agent]
        G --> H[AI Models]
        H --> G
        G --> I[Draft Articles DB]
    end
    
    subgraph "Quality Phase"
        I --> J[Quality Control Agent]
        J --> K[Plagiarism Check]
        J --> L[Fact Check]
        J --> M[Brand Voice Check]
        K --> N{Approved?}
        L --> N
        M --> N
    end
    
    subgraph "Optimization Phase"
        N -->|Yes| O[SEO Agent]
        O --> P[Keyword Analysis]
        O --> Q[Meta Optimization]
        P --> R[Optimized Content]
        Q --> R
    end
    
    subgraph "Publication Phase"
        R --> S[Publisher Agent]
        S --> T[CMS/Website]
        S --> U[Social Media]
        S --> V[Newsletter]
    end
    
    subgraph "Analytics Phase"
        T --> W[Analytics Agent]
        U --> W
        V --> W
        W --> X[Performance Metrics]
        X --> Y[Feedback Loop]
        Y --> B
    end
    
    N -->|No| Z[Revision Queue]
    Z --> G
```

## Database Schema Overview

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role
        timestamp created_at
        timestamp updated_at
        boolean is_active
    }
    
    ARTICLES {
        uuid id PK
        string title
        text content
        text summary
        string slug UK
        enum status
        json metadata
        uuid author_id FK
        uuid category_id FK
        timestamp published_at
        timestamp created_at
        timestamp updated_at
        integer view_count
        float quality_score
    }
    
    CATEGORIES {
        uuid id PK
        string name UK
        string description
        string slug UK
        integer sort_order
        boolean is_active
        timestamp created_at
    }
    
    TAGS {
        uuid id PK
        string name UK
        string slug UK
        integer usage_count
        timestamp created_at
    }
    
    ARTICLE_TAGS {
        uuid article_id FK
        uuid tag_id FK
        timestamp created_at
    }
    
    SOURCES {
        uuid id PK
        string name
        string url
        enum type
        float credibility_score
        json api_config
        boolean is_active
        timestamp created_at
        timestamp last_crawled
    }
    
    AGENT_TASKS {
        uuid id PK
        string agent_name
        enum task_type
        json payload
        enum status
        json result
        timestamp created_at
        timestamp completed_at
        integer retry_count
        string error_message
    }
    
    ANALYTICS {
        uuid id PK
        uuid article_id FK
        string metric_name
        float metric_value
        json metadata
        timestamp recorded_at
    }
    
    USERS ||--o{ ARTICLES : writes
    CATEGORIES ||--o{ ARTICLES : contains
    ARTICLES ||--o{ ARTICLE_TAGS : has
    TAGS ||--o{ ARTICLE_TAGS : applied_to
    ARTICLES ||--o{ ANALYTICS : tracked_by
    SOURCES ||--o{ AGENT_TASKS : crawled_by
```

## Security Architecture

```mermaid
graph TB
    subgraph "External Threats"
        A[DDoS Attacks]
        B[SQL Injection]
        C[XSS Attacks]
        D[CSRF Attacks]
        E[Data Breaches]
    end
    
    subgraph "Security Layers"
        F[WAF & DDoS Protection]
        G[API Gateway Security]
        H[Application Security]
        I[Database Security]
        J[Network Security]
    end
    
    subgraph "Security Controls"
        K[Rate Limiting]
        L[Input Validation]
        M[Output Encoding]
        N[Authentication]
        O[Authorization]
        P[Encryption at Rest]
        Q[Encryption in Transit]
        R[Audit Logging]
    end
    
    subgraph "Monitoring & Response"
        S[SIEM System]
        T[Intrusion Detection]
        U[Vulnerability Scanning]
        V[Incident Response]
        W[Security Alerts]
    end
    
    A --> F
    B --> G
    C --> H
    D --> H
    E --> I
    
    F --> K
    G --> L
    G --> N
    H --> M
    H --> O
    I --> P
    J --> Q
    
    K --> S
    L --> T
    M --> U
    N --> V
    O --> W
    P --> S
    Q --> T
    R --> S
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            A[CloudFlare CDN]
            B[Load Balancer]
        end
        
        subgraph "Application Tier"
            C[API Server 1]
            D[API Server 2]
            E[API Server 3]
        end
        
        subgraph "Agent Tier"
            F[Agent Pool 1]
            G[Agent Pool 2]
            H[Agent Pool 3]
        end
        
        subgraph "Data Tier"
            I[PostgreSQL Primary]
            J[PostgreSQL Replica 1]
            K[PostgreSQL Replica 2]
            L[Redis Cluster]
            M[Vector DB]
        end
        
        subgraph "Monitoring"
            N[Prometheus]
            O[Grafana]
            P[Alertmanager]
        end
    end
    
    subgraph "External Services"
        Q[News APIs]
        R[AI Services]
        S[Payment Gateway]
        T[Email Service]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    
    C --> F
    D --> G
    E --> H
    
    C --> I
    D --> J
    E --> K
    C --> L
    D --> L
    E --> L
    
    F --> Q
    G --> R
    H --> S
    
    C --> N
    D --> N
    E --> N
    N --> O
    N --> P
```

## CI/CD Pipeline

```mermaid
flowchart LR
    A[Developer Push] --> B[GitHub Repository]
    B --> C{Branch?}
    
    C -->|Feature Branch| D[Feature Tests]
    C -->|Phase Branch| E[Integration Tests]
    C -->|Main Branch| F[Full Test Suite]
    
    D --> G[Code Review]
    E --> H[Staging Deploy]
    F --> I[Production Deploy]
    
    G --> J{Review Approved?}
    J -->|Yes| K[Merge to Phase Branch]
    J -->|No| L[Back to Development]
    
    H --> M[Staging Tests]
    M --> N{Tests Pass?}
    N -->|Yes| O[Ready for Production]
    N -->|No| P[Fix Issues]
    
    I --> Q[Blue-Green Deploy]
    Q --> R[Health Checks]
    R --> S{Healthy?}
    S -->|Yes| T[Switch Traffic]
    S -->|No| U[Rollback]
    
    T --> V[Monitor Metrics]
    U --> W[Incident Response]
    
    K --> E
    P --> H
    L --> A
```

---

*These diagrams provide a visual representation of the DigitalTide architecture and can be rendered in GitHub, VS Code, and other Markdown-compatible viewers that support Mermaid diagrams.*