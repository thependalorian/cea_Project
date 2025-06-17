"""
LangGraph Response Models - Optimized for Conversational Flow

Following the audit recommendations:
- Clean, structured responses with Pydantic validation
- Conversational tone with 50-150 word responses
- Clear confidence scoring and next actions
- Proper message formatting for LangGraph

Location: backendv1/models/response_models.py
"""

from typing import Dict, Any, List, Optional, Literal, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator
from langchain_core.messages import AIMessage, HumanMessage, BaseMessage


class ConversationalResponse(BaseModel):
    """
    Optimized conversational response model for LangGraph workflows
    
    Follows audit recommendations:
    - Concise responses (50-150 words)
    - Clear confidence scoring
    - Natural conversational tone
    - Actionable next steps
    """
    
    # Core response content
    message: str = Field(
        ..., 
        description="Conversational response message (50-150 words)",
        min_length=10,
        max_length=800
    )
    
    # Response metadata
    response_type: Literal[
        "greeting", 
        "analysis", 
        "guidance", 
        "question", 
        "summary", 
        "error"
    ] = Field(default="guidance", description="Type of response")
    
    confidence_score: float = Field(
        default=0.7, 
        ge=0.0, 
        le=1.0, 
        description="Confidence in response accuracy"
    )
    
    # Conversation flow
    needs_user_input: bool = Field(
        default=False, 
        description="Whether response requires user input to continue"
    )
    
    conversation_complete: bool = Field(
        default=False, 
        description="Whether conversation can end here"
    )
    
    # Action guidance
    suggested_actions: List[str] = Field(
        default_factory=list,
        max_items=3,
        description="Up to 3 suggested next actions for user"
    )
    
    quick_replies: List[str] = Field(
        default_factory=list,
        max_items=4,
        description="Quick reply options for user"
    )
    
    # Context and metadata
    agent_name: Optional[str] = Field(
        default=None,
        description="Name of agent providing response"
    )
    
    workflow_stage: str = Field(
        default="discovery",
        description="Current stage in workflow"
    )
    
    sources: List[str] = Field(
        default_factory=list,
        description="Data sources used in response"
    )
    
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp"
    )

    @validator('message')
    def validate_conversational_tone(cls, v):
        """Ensure message is conversational and appropriate length"""
        if len(v.split()) < 8:
            raise ValueError("Response too short - should be conversational (8+ words)")
        if len(v.split()) > 200:
            raise ValueError("Response too long - should be concise (under 200 words)")
        return v

    @validator('suggested_actions')
    def validate_actions(cls, v):
        """Ensure actions are actionable and concise"""
        for action in v:
            if len(action.split()) > 10:
                raise ValueError("Actions should be concise (under 10 words)")
        return v

    def to_ai_message(self) -> AIMessage:
        """Convert to LangGraph AIMessage format"""
        return AIMessage(
            content=self.message,
            additional_kwargs={
                "response_type": self.response_type,
                "confidence_score": self.confidence_score,
                "needs_user_input": self.needs_user_input,
                "conversation_complete": self.conversation_complete,
                "suggested_actions": self.suggested_actions,
                "quick_replies": self.quick_replies,
                "agent_name": self.agent_name,
                "workflow_stage": self.workflow_stage,
                "sources": self.sources,
                "timestamp": self.timestamp.isoformat()
            }
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses"""
        return {
            "message": self.message,
            "response_type": self.response_type,
            "confidence_score": self.confidence_score,
            "needs_user_input": self.needs_user_input,
            "conversation_complete": self.conversation_complete,
            "suggested_actions": self.suggested_actions,
            "quick_replies": self.quick_replies,
            "agent_name": self.agent_name,
            "workflow_stage": self.workflow_stage,
            "sources": self.sources,
            "timestamp": self.timestamp.isoformat()
        }


class WorkflowState(BaseModel):
    """
    Clean workflow state model for LangGraph
    
    Following audit recommendations:
    - Simple state management
    - Clear message accumulation
    - Minimal complexity
    """
    
    # Message history
    messages: List[BaseMessage] = Field(
        default_factory=list,
        description="Conversation message history"
    )
    
    # Workflow control
    current_stage: str = Field(
        default="initial",
        description="Current workflow stage"
    )
    
    needs_human_review: bool = Field(
        default=False,
        description="Whether human review is needed"
    )
    
    conversation_complete: bool = Field(
        default=False,
        description="Whether conversation is complete"
    )
    
    # User context
    user_id: Optional[str] = Field(
        default=None,
        description="User identifier"
    )
    
    session_id: Optional[str] = Field(
        default=None,
        description="Session identifier"
    )
    
    # Findings and insights
    findings: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Accumulated insights and findings"
    )
    
    # Confidence tracking
    overall_confidence: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Overall confidence in recommendations"
    )
    
    # Metadata
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="State creation timestamp"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp"
    )

    def add_message(self, message: BaseMessage) -> None:
        """Add message to conversation history"""
        self.messages.append(message)
        self.updated_at = datetime.utcnow()

    def add_finding(self, finding: Dict[str, Any]) -> None:
        """Add finding to accumulated insights"""
        finding["timestamp"] = datetime.utcnow().isoformat()
        self.findings.append(finding)
        self.updated_at = datetime.utcnow()

    def get_latest_user_message(self) -> Optional[str]:
        """Get the latest user message content"""
        for message in reversed(self.messages):
            if isinstance(message, HumanMessage):
                return message.content
        return None

    def get_conversation_summary(self) -> str:
        """Get a summary of the conversation"""
        if not self.messages:
            return "No conversation yet"
        
        user_messages = [m.content for m in self.messages if isinstance(m, HumanMessage)]
        ai_messages = [m.content for m in self.messages if isinstance(m, AIMessage)]
        
        return f"Conversation: {len(user_messages)} user messages, {len(ai_messages)} AI responses"


class SimpleGreetingResponse(ConversationalResponse):
    """Optimized response for simple greetings like 'hi', 'hello'"""
    
    response_type: Literal["greeting"] = "greeting"
    needs_user_input: bool = True
    conversation_complete: bool = False
    
    @classmethod
    def create_friendly_greeting(
        cls, 
        user_message: str = "hi",
        agent_name: str = "Climate Assistant"
    ) -> "SimpleGreetingResponse":
        """Create a friendly greeting response"""
        
        # Simple greeting responses
        greetings = {
            "hi": "Hi there! I'm here to help you explore climate career opportunities. What interests you most?",
            "hello": "Hello! I'm your climate career assistant. How can I help you today?",
            "hey": "Hey! Ready to dive into climate careers? What would you like to know?",
        }
        
        # Default friendly response
        message = greetings.get(
            user_message.lower().strip(),
            "Hi! I'm here to help with your climate career journey. What would you like to explore?"
        )
        
        return cls(
            message=message,
            confidence_score=0.9,
            suggested_actions=[
                "Tell me about your background",
                "Show me climate job opportunities", 
                "Help me explore career paths"
            ],
            quick_replies=[
                "I'm new to climate careers",
                "I want to transition to climate",
                "Show me job opportunities",
                "Help me get started"
            ],
            agent_name=agent_name,
            workflow_stage="greeting"
        )


class ErrorResponse(ConversationalResponse):
    """Response model for error situations"""
    
    response_type: Literal["error"] = "error"
    confidence_score: float = 0.3
    needs_user_input: bool = True
    
    @classmethod
    def create_friendly_error(
        cls,
        error_message: str = "I encountered a technical issue",
        agent_name: str = "Climate Assistant"
    ) -> "ErrorResponse":
        """Create a user-friendly error response"""
        
        return cls(
            message=f"I'm sorry, {error_message.lower()}. Let me help you in a different way. What specific aspect of climate careers interests you?",
            suggested_actions=[
                "Try asking a different question",
                "Tell me about your background",
                "Explore climate job opportunities"
            ],
            quick_replies=[
                "Start over",
                "Get help",
                "Try something else"
            ],
            agent_name=agent_name,
            workflow_stage="error_recovery"
        )


# Factory functions for common responses
def create_greeting_response(user_message: str) -> ConversationalResponse:
    """Factory function for greeting responses"""
    return SimpleGreetingResponse.create_friendly_greeting(user_message)


def create_analysis_response(
    message: str,
    confidence: float = 0.7,
    actions: List[str] = None,
    agent_name: str = "Climate Assistant"
) -> ConversationalResponse:
    """Factory function for analysis responses"""
    
    return ConversationalResponse(
        message=message,
        response_type="analysis",
        confidence_score=confidence,
        suggested_actions=actions or ["Continue analysis", "Ask a question", "Get recommendations"],
        agent_name=agent_name,
        workflow_stage="analysis"
    )


def create_error_response(error: str) -> ConversationalResponse:
    """Factory function for error responses"""
    return ErrorResponse.create_friendly_error(error)


# Response type detection
def detect_response_type(user_message: str) -> str:
    """Detect the type of response needed based on user message"""
    
    message_lower = user_message.lower().strip()
    
    # Simple greetings
    if message_lower in ["hi", "hello", "hey", "sup", "yo"]:
        return "greeting"
    
    # Questions
    if any(word in message_lower for word in ["what", "how", "why", "when", "where", "which", "?"]):
        return "question"
    
    # Analysis requests
    if any(word in message_lower for word in ["analyze", "review", "assess", "evaluate", "check"]):
        return "analysis"
    
    # Default to guidance
    return "guidance" 