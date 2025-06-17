# Climate Economy Assistant Workflow Diagrams

This document contains visual representations of the key workflows in the Climate Economy Assistant system.

## Main Agent Workflow

The Climate Economy Assistant uses a supervisor agent that routes queries to specialized agents based on the query content.

```mermaid
flowchart TD
    subgraph "Climate Economy Assistant Workflow"
    User[User Query] --> Supervisor[Climate Supervisor]
    Supervisor --> Decision{Route Query}
    
    Decision -->|Career Questions| Lauren[Lauren Agent]
    Decision -->|Climate Knowledge| Marcus[Marcus Agent]
    Decision -->|Job Search| Miguel[Miguel Agent]
    Decision -->|Skills Analysis| Mai[Mai Agent]
    Decision -->|Education| Liv[Liv Agent]
    Decision -->|Community| Jasmine[Jasmine Agent]
    Decision -->|General Support| Pendo[Pendo Agent]
    
    Lauren --> Response[Response Generation]
    Marcus --> Response
    Miguel --> Response
    Mai --> Response
    Liv --> Response
    Jasmine --> Response
    Pendo --> Response
    
    Response --> User
    end
```

## LangGraph Flow Control

The LangGraph workflow system manages state and flow control between different nodes in the agent system.

```mermaid
flowchart TD
    subgraph "LangGraph Flow Control"
    Start[Start] --> State[Initialize State]
    State --> SupervisorNode[Supervisor Node]
    SupervisorNode --> Decision{Decision}
    
    Decision -->|Route to Agent| AgentNode[Agent Processing]
    Decision -->|Human Intervention| HumanNode[Human in the Loop]
    Decision -->|Additional Context| ContextNode[Context Gathering]
    
    AgentNode --> ResponseGen[Response Generation]
    HumanNode --> ResponseGen
    ContextNode --> SupervisorNode
    
    ResponseGen --> Complete{Complete?}
    Complete -->|Yes| End[End]
    Complete -->|No| SupervisorNode
    end
```

## BackendV1 Architecture

The BackendV1 system architecture showing how components interact.

```mermaid
flowchart LR
    subgraph "BackendV1 Architecture"
    Client[Client] --> API[FastAPI Endpoints]
    
    API --> Auth[Authentication]
    Auth --> Supervisor[Climate Supervisor]
    
    Supervisor --> AgentPool[Agent Pool]
    AgentPool --> Lauren[Lauren]
    AgentPool --> Marcus[Marcus]
    AgentPool --> Miguel[Miguel]
    AgentPool --> Mai[Mai]
    AgentPool --> Liv[Liv]
    AgentPool --> Jasmine[Jasmine]
    AgentPool --> Pendo[Pendo]
    
    Supervisor --> Tools[Tools]
    Tools --> Database[(Supabase)]
    Tools --> Search[Search]
    Tools --> Analytics[Analytics]
    
    AgentPool --> Response[Response]
    Response --> Client
    end
```

## Query Processing Sequence

Sequence diagram showing the flow of a user query through the system.

```mermaid
sequenceDiagram
    participant User
    participant API as API Endpoint
    participant Auth as Authentication
    participant Supervisor as Climate Supervisor
    participant Agent as Specialist Agent
    participant DB as Database
    
    User->>API: Send Query
    API->>Auth: Authenticate Request
    Auth->>Supervisor: Forward Authenticated Query
    Supervisor->>Supervisor: Analyze Query Intent
    Supervisor->>Agent: Route to Appropriate Agent
    Agent->>DB: Retrieve Context
    DB->>Agent: Return Data
    Agent->>Agent: Process Query with Context
    Agent->>Supervisor: Return Response
    Supervisor->>API: Format Response
    API->>User: Deliver Response
```

## Human-in-the-Loop Workflow

The system includes human review for low-confidence responses. User steering requires immediate feedback to maintain context.

```mermaid
flowchart TD
    subgraph "Human-in-the-Loop Workflow"
    Start[User Query] --> Analysis[AI Analysis]
    Analysis --> Confidence{Confidence Check}
    
    Confidence -->|High Confidence| DirectResponse[Direct AI Response]
    Confidence -->|Low Confidence| HumanReview[Human Expert Review]
    
    HumanReview --> HumanDecision{Human Decision}
    HumanDecision -->|Approve| ApprovedResponse[Approved Response]
    HumanDecision -->|Modify| ModifiedResponse[Modified Response]
    HumanDecision -->|Reject| RejectedResponse[New AI Response]
    
    DirectResponse --> Feedback[User Feedback]
    ApprovedResponse --> Feedback
    ModifiedResponse --> Feedback
    RejectedResponse --> Feedback
    
    Feedback --> Learning[System Learning]
    Learning --> End[End]
    
    %% Important: Always provide immediate acknowledgment
    HumanReview --> AcknowledgeUser[Acknowledge User]
    AcknowledgeUser -->|"Waiting for expert review"| UserWait[User Waiting State]
    UserWait --> ApprovedResponse
    end
```


## BackendV1 Architecture

The BackendV1 system architecture showing how components interact.

```mermaid
flowchart LR
    subgraph "BackendV1 Architecture"
    Client[Client] --> API[FastAPI Endpoints]
    
    API --> Auth[Authentication]
