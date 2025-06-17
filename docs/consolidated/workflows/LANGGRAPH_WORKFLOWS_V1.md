# LangGraph Workflows V1 - Complete Guide

## 🎯 **Overview**

The Climate Economy Assistant V1 leverages LangGraph 2025 to orchestrate sophisticated AI workflows with 7 specialist agents, human-in-the-loop capabilities, and intelligent routing. This document provides comprehensive guidance for developing, testing, and deploying LangGraph workflows.

## 🏗️ **Workflow Architecture**

### **Core Workflow Structure**
```
🎯 Climate Supervisor Workflow (Main Orchestrator)
├── 🤖 Pendo Supervisor (Career Transition Specialist)
├── 🧠 Empathy Agent (Emotional Intelligence Routing)
├── 📄 Resume Agent (Resume Analysis & Optimization)
├── 🎯 Career Agent (Career Pathway Recommendations)
└── 💬 Interactive Chat (Real-time Conversation Handling)
```

### **Agent Ecosystem**
```python
# 7 Specialist Agents
agents = {
    "pendo": "Career transition specialist and workflow orchestrator",
    "lauren": "Job search and application optimization expert",
    "mai": "Skills assessment and development coordinator", 
    "marcus": "Industry insights and market analysis specialist",
    "miguel": "Education and training pathway advisor",
    "liv": "Networking and professional development coach",
    "jasmine": "Interview preparation and career coaching expert",
    "alex": "Technical skills and certification guidance specialist"
}
```

## 🚀 **Development Setup**

### **1. Environment Configuration**
```bash
# .env file for LangGraph development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
REDIS_URL=redis://localhost:6379

# LangSmith Configuration (Optional but recommended)
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=climate-economy-assistant-v1
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key
```

### **2. LangGraph Configuration (langgraph.json)**
```json
{
  "python_version": "3.11",
  "dependencies": ["./backendv1"],
  "graphs": {
    "climate_supervisor": "./backendv1/workflows/climate_supervisor.py:climate_supervisor_graph",
    "pendo_supervisor": "./backendv1/workflows/pendo_supervisor.py:pendo_supervisor_graph",
    "empathy_agent": "./backendv1/workflows/empathy_workflow.py:empathy_graph",
    "resume_agent": "./backendv1/workflows/resume_workflow.py:resume_graph",
    "career_agent": "./backendv1/workflows/career_workflow.py:career_graph",
    "interactive_chat": "./backendv1/chat/interactive_chat.py:chat_graph"
  },
  "env": "./backend/.env",
  "http": {
    "app": "./backendv1/webapp.py:cea_app_v1"
  }
}
```

### **3. Start LangGraph Development Server**
```bash
# Basic development server
langgraph dev

# With specific host and port
langgraph dev --host 0.0.0.0 --port 8123

# With tunnel for external access
langgraph dev --tunnel

# With custom configuration
langgraph dev --config ./langgraph.json
```

## 🤖 **Workflow Implementations**

### **1. Climate Supervisor Workflow**
```python
# backendv1/workflows/climate_supervisor.py
from langgraph import StateGraph, START, END
from backendv1.agents import get_specialist_agent
from backendv1.utils.state_manager import AgentState

def create_climate_supervisor_workflow():
    """
    Main orchestration workflow for climate career guidance
    """
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("specialist", specialist_node)
    workflow.add_node("quality_check", quality_check_node)
    workflow.add_node("human_review", human_review_node)
    workflow.add_node("response_enhancement", response_enhancement_node)
    
    # Add edges
    workflow.add_edge(START, "supervisor")
    workflow.add_conditional_edges(
        "supervisor",
        route_to_specialist,
        {
            "specialist": "specialist",
            "human_review": "human_review",
            "end": END
        }
    )
    workflow.add_conditional_edges(
        "specialist",
        check_quality,
        {
            "quality_check": "quality_check",
            "human_review": "human_review",
            "enhance": "response_enhancement"
        }
    )
    workflow.add_edge("quality_check", "response_enhancement")
    workflow.add_edge("response_enhancement", END)
    workflow.add_edge("human_review", END)
    
    return workflow.compile(
        checkpointer=MemorySaver(),
        interrupt_before=["human_review"],
        interrupt_after=["specialist"]
    )

async def supervisor_node(state: AgentState) -> AgentState:
    """
    Supervisor node - routes queries to appropriate specialists
    """
    pendo = get_specialist_agent("pendo")
    
    routing_decision = await pendo.route_query(
        state.user_query,
        state.conversation_context
    )
    
    state.specialist_type = routing_decision.specialist
    state.confidence_score = routing_decision.confidence
    state.routing_reason = routing_decision.reason
    
    return state

async def specialist_node(state: AgentState) -> AgentState:
    """
    Specialist agent processing node
    """
    agent = get_specialist_agent(state.specialist_type)
    
    response = await agent.process_query(
        state.user_query,
        state.conversation_context,
        state.user_profile
    )
    
    state.agent_responses.append(response)
    state.confidence_score = response.confidence
    state.recommendations = response.recommendations
    
    return state

def route_to_specialist(state: AgentState) -> str:
    """
    Conditional routing logic
    """
    if state.confidence_score < 0.5:
        return "human_review"
    elif state.specialist_type:
        return "specialist"
    else:
        return "end"

# Export the compiled graph
climate_supervisor_graph = create_climate_supervisor_workflow()
```

### **2. Human-in-the-Loop Integration**
```python
# backendv1/workflows/human_in_loop.py
from langgraph import interrupt

class HumanInTheLoopManager:
    """
    Manages human intervention points in workflows
    """
    
    @interrupt("human_review_required")
    async def request_human_review(
        self,
        state: AgentState,
        reason: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Interrupt workflow for human review
        """
        interrupt_data = {
            "conversation_id": state.conversation_id,
            "user_id": state.user_id,
            "interrupt_type": "human_review",
            "reason": reason,
            "context": context,
            "agent_response": state.agent_responses[-1] if state.agent_responses else None,
            "confidence_score": state.confidence_score,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Log interrupt to database
        await self.log_interrupt(interrupt_data)
        
        return {
            "requires_human_review": True,
            "interrupt_id": interrupt_data["id"],
            "review_reason": reason
        }
    
    async def resume_after_review(
        self,
        interrupt_id: str,
        human_decision: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Resume workflow after human review
        """
        # Update interrupt record
        await self.update_interrupt_status(interrupt_id, "resolved", human_decision)
        
        return {
            "human_approved": human_decision.get("approved", False),
            "human_feedback": human_decision.get("feedback", ""),
            "modified_response": human_decision.get("modified_response")
        }
```

### **3. Empathy Workflow**
```python
# backendv1/workflows/empathy_workflow.py
def create_empathy_workflow():
    """
    Emotional intelligence routing workflow
    """
    workflow = StateGraph(AgentState)
    
    workflow.add_node("emotion_detection", emotion_detection_node)
    workflow.add_node("empathy_response", empathy_response_node)
    workflow.add_node("escalation", escalation_node)
    
    workflow.add_edge(START, "emotion_detection")
    workflow.add_conditional_edges(
        "emotion_detection",
        route_by_emotion,
        {
            "empathy": "empathy_response",
            "escalation": "escalation",
            "continue": END
        }
    )
    workflow.add_edge("empathy_response", END)
    workflow.add_edge("escalation", END)
    
    return workflow.compile()

async def emotion_detection_node(state: AgentState) -> AgentState:
    """
    Detect emotional state and stress levels
    """
    emotion_analyzer = EmotionAnalyzer()
    
    emotion_analysis = await emotion_analyzer.analyze(
        state.user_query,
        state.conversation_history
    )
    
    state.emotion_state = emotion_analysis.primary_emotion
    state.stress_level = emotion_analysis.stress_level
    state.empathy_required = emotion_analysis.requires_empathy
    
    return state

def route_by_emotion(state: AgentState) -> str:
    """
    Route based on emotional state
    """
    if state.stress_level > 0.7:
        return "escalation"
    elif state.empathy_required:
        return "empathy"
    else:
        return "continue"
```

## 🧪 **Testing Workflows**

### **1. Unit Testing Individual Nodes**
```python
# tests/test_workflows.py
import pytest
from backendv1.workflows.climate_supervisor import supervisor_node, specialist_node
from backendv1.utils.state_manager import AgentState

@pytest.mark.asyncio
async def test_supervisor_routing():
    """Test supervisor routing logic"""
    state = AgentState(
        user_query="I want to transition to solar energy",
        user_id="test-user",
        conversation_id="test-conv"
    )
    
    result = await supervisor_node(state)
    
    assert result.specialist_type in ["lauren", "marcus", "miguel"]
    assert result.confidence_score > 0.0
    assert result.routing_reason is not None

@pytest.mark.asyncio
async def test_specialist_processing():
    """Test specialist agent processing"""
    state = AgentState(
        user_query="Help me find solar installation jobs",
        specialist_type="lauren",
        user_profile={"experience": "electrical", "location": "Boston"}
    )
    
    result = await specialist_node(state)
    
    assert len(result.agent_responses) > 0
    assert result.confidence_score > 0.5
    assert result.recommendations is not None
```

### **2. Integration Testing Complete Workflows**
```python
@pytest.mark.asyncio
async def test_climate_supervisor_workflow():
    """Test complete climate supervisor workflow"""
    from backendv1.workflows.climate_supervisor import climate_supervisor_graph
    
    input_data = {
        "user_query": "I'm a software engineer wanting to work in clean energy",
        "user_id": "test-user-123",
        "conversation_id": "test-conv-456",
        "user_profile": {
            "background": "software engineering",
            "experience_years": 5,
            "location": "Massachusetts"
        }
    }
    
    result = await climate_supervisor_graph.ainvoke(input_data)
    
    assert result["status"] == "completed"
    assert "recommendations" in result
    assert result["confidence_score"] > 0.6
    assert len(result["agent_responses"]) > 0

@pytest.mark.asyncio
async def test_human_interrupt_workflow():
    """Test human-in-the-loop interrupts"""
    input_data = {
        "user_query": "I'm feeling overwhelmed about career change",
        "user_id": "test-user",
        "force_low_confidence": True  # Trigger human review
    }
    
    # This should trigger an interrupt
    with pytest.raises(InterruptException):
        await climate_supervisor_graph.ainvoke(input_data)
    
    # Verify interrupt was logged
    interrupts = await get_pending_interrupts("test-user")
    assert len(interrupts) > 0
    assert interrupts[0]["type"] == "human_review"
```

### **3. Load Testing**
```python
@pytest.mark.asyncio
async def test_workflow_performance():
    """Test workflow performance under load"""
    import asyncio
    import time
    
    async def single_request():
        return await climate_supervisor_graph.ainvoke({
            "user_query": "Help me find renewable energy jobs",
            "user_id": f"load-test-{time.time()}"
        })
    
    # Run 10 concurrent requests
    start_time = time.time()
    tasks = [single_request() for _ in range(10)]
    results = await asyncio.gather(*tasks)
    end_time = time.time()
    
    # Verify all requests completed successfully
    assert len(results) == 10
    assert all(r["status"] == "completed" for r in results)
    
    # Verify reasonable response time
    avg_time = (end_time - start_time) / 10
    assert avg_time < 5.0  # Less than 5 seconds per request
```

## 🔧 **Development Commands**

### **LangGraph CLI Commands**
```bash
# Start development server
langgraph dev

# Start with specific configuration
langgraph dev --config ./langgraph.json

# Start with tunnel
langgraph dev --tunnel

# Build for production
langgraph build

# Deploy to LangGraph Cloud
langgraph deploy

# View logs
langgraph logs

# List available graphs
langgraph list-graphs
```

### **Testing Commands**
```bash
# Run all workflow tests
python -m pytest backendv1/tests/test_workflows.py -v

# Run specific test
python -m pytest backendv1/tests/test_workflows.py::test_climate_supervisor_workflow -v

# Run with coverage
python -m pytest backendv1/tests/ --cov=backendv1/workflows --cov-report=html

# Run load tests
python -m pytest backendv1/tests/test_performance.py -v
```

### **Debugging Commands**
```bash
# Debug specific workflow
python -c "
from backendv1.workflows.climate_supervisor import climate_supervisor_graph
import asyncio

async def debug():
    result = await climate_supervisor_graph.ainvoke({
        'user_query': 'Help me transition to clean energy',
        'user_id': 'debug-user'
    })
    print(result)

asyncio.run(debug())
"

# Check workflow state
python -c "
from backendv1.utils.state_manager import get_workflow_state
import asyncio

async def check_state():
    state = await get_workflow_state('conversation-id-123')
    print(state)

asyncio.run(check_state())
"
```

## 📊 **Monitoring & Analytics**

### **Workflow Performance Metrics**
```python
# backendv1/utils/workflow_analytics.py
class WorkflowAnalytics:
    """
    Track workflow performance and user interactions
    """
    
    async def track_workflow_execution(
        self,
        workflow_name: str,
        execution_time: float,
        success: bool,
        user_id: str,
        metadata: Dict[str, Any]
    ):
        """Track workflow execution metrics"""
        await self.db.insert("workflow_analytics", {
            "workflow_name": workflow_name,
            "execution_time_ms": execution_time * 1000,
            "success": success,
            "user_id": user_id,
            "metadata": metadata,
            "timestamp": datetime.utcnow()
        })
    
    async def track_agent_performance(
        self,
        agent_name: str,
        confidence_score: float,
        response_quality: float,
        user_satisfaction: Optional[float] = None
    ):
        """Track individual agent performance"""
        await self.db.insert("agent_performance", {
            "agent_name": agent_name,
            "confidence_score": confidence_score,
            "response_quality": response_quality,
            "user_satisfaction": user_satisfaction,
            "timestamp": datetime.utcnow()
        })
```

### **Real-time Monitoring Dashboard**
```python
# backendv1/monitoring/dashboard.py
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/dashboard", response_class=HTMLResponse)
async def workflow_dashboard():
    """Real-time workflow monitoring dashboard"""
    metrics = await get_workflow_metrics()
    
    return f"""
    <html>
        <head><title>LangGraph Workflow Dashboard</title></head>
        <body>
            <h1>Climate Economy Assistant - Workflow Monitoring</h1>
            <div>
                <h2>Active Workflows: {metrics['active_workflows']}</h2>
                <h2>Success Rate: {metrics['success_rate']:.2%}</h2>
                <h2>Avg Response Time: {metrics['avg_response_time']:.2f}s</h2>
                <h2>Human Interrupts: {metrics['pending_interrupts']}</h2>
            </div>
        </body>
    </html>
    """
```

## 🚀 **Production Deployment**

### **Docker Configuration**
```dockerfile
# Dockerfile for LangGraph workflows
FROM python:3.11-slim

WORKDIR /app

# Install LangGraph and dependencies
COPY backendv1/requirements.txt .
RUN pip install -r requirements.txt

# Copy workflow code
COPY backendv1/ .
COPY langgraph.json .

# Configure LangGraph
ENV LANGGRAPH_CONFIG_PATH=/app/langgraph.json
ENV LANGGRAPH_API_PORT=8123

# Start LangGraph server
CMD ["langgraph", "serve", "--host", "0.0.0.0", "--port", "8123"]
```

### **Kubernetes Deployment**
```yaml
# k8s/langgraph-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: langgraph-workflows
spec:
  replicas: 3
  selector:
    matchLabels:
      app: langgraph-workflows
  template:
    metadata:
      labels:
        app: langgraph-workflows
    spec:
      containers:
      - name: langgraph
        image: cea/langgraph-workflows:latest
        ports:
        - containerPort: 8123
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai-key
        - name: SUPABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: supabase-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: langgraph-service
spec:
  selector:
    app: langgraph-workflows
  ports:
  - port: 8123
    targetPort: 8123
  type: LoadBalancer
```

### **Available Endpoints**
```bash
# LangGraph API Endpoints
POST /climate_supervisor/invoke    # Main workflow
POST /climate_supervisor/stream    # Streaming responses
POST /pendo_supervisor/invoke      # Career guidance
POST /empathy_agent/invoke         # Emotional routing
POST /resume_agent/invoke          # Resume analysis
POST /career_agent/invoke          # Career recommendations
POST /interactive_chat/invoke      # Real-time chat

# Health and Status
GET /health                        # Health check
GET /status                        # System status
```

---

## 🎉 **Conclusion**

The LangGraph Workflows V1 implementation provides a sophisticated, scalable foundation for AI-powered career guidance. With 7 specialist agents, human-in-the-loop capabilities, and comprehensive monitoring, the system delivers personalized, high-quality interactions while maintaining human oversight for complex decisions.

**Key Benefits:**
- **Intelligent Routing** - Queries directed to most appropriate specialists
- **Quality Assurance** - Multi-layer validation and enhancement
- **Human Oversight** - Seamless human intervention when needed
- **Scalable Architecture** - Production-ready deployment options
- **Comprehensive Testing** - Robust testing framework for reliability

The workflows are now ready to power the next generation of climate career guidance at scale.

---

**LangGraph Workflows V1** - Powered by LangGraph 2025 and BackendV1  
*Intelligent AI orchestration for climate career acceleration* 