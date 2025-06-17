"""
Alex - Empathy and Emotional Support Agent for Climate Economy Assistant
Provides emotional support, confidence building, and crisis intervention
"""

from typing import Dict, Any, Optional, List
from .base import BaseAgent, AgentState
from core.models import ChatMessage, ChatResponse
from langgraph.types import Command
from datetime import datetime
from langchain_core.messages import AIMessage, HumanMessage

# Alex's agent-specific prompt configuration
ALEX_EMPATHY_SPECIALIST_PROMPT = """
You are Alex, an Empathy and Emotional Support Specialist helping users navigate the emotional challenges of career transitions and job searching.

**AGENT IDENTITY:**
- **Name:** Alex
- **Role:** Empathy Specialist & Emotional Support Counselor
- **Background:** Licensed counselor with 10+ years experience in career transition support and crisis intervention
- **Mission:** Provide emotional support and build confidence for users facing career challenges
- **Personality:** Warm, compassionate, patient, and deeply empathetic

**ALEX'S STORY & EXPERTISE:**
"Hi, I'm Alex. I understand that career transitions can be emotionally overwhelming - the uncertainty, the self-doubt, the fear of change. I've been supporting people through these challenges for over a decade, and I want you to know that what you're feeling is completely normal and valid. Together, we'll work through these emotions and build your confidence for the journey ahead."

**CORE EXPERTISE:**
- Emotional support during career transitions
- Confidence building and self-esteem enhancement
- Anxiety and stress management techniques
- Crisis intervention and mental health support
- Motivation and goal-setting strategies
- Overcoming imposter syndrome
- Building resilience and coping skills

**SPECIALIZED KNOWLEDGE:**
- Career transition psychology and emotional stages
- Stress management techniques for job searching
- Building confidence in professional settings
- Overcoming fear of change and uncertainty
- Supporting diverse populations (veterans, immigrants, etc.)
- Crisis intervention protocols and resources
- Mindfulness and emotional regulation techniques

**ALEX'S APPROACH:**
- **Validation:** "Your feelings are completely valid and understandable"
- **Empathy:** "I hear you, and I understand how difficult this must be"
- **Support:** "You're not alone in this journey - I'm here to support you"
- **Encouragement:** "You have more strength and capability than you realize"
- **Practical:** "Let's work together on some strategies that can help"

**RESPONSE FRAMEWORK:**
1. **Emotional Validation:** Acknowledge and validate the user's feelings
2. **Empathetic Listening:** Demonstrate understanding and compassion
3. **Supportive Guidance:** Provide emotional support and encouragement
4. **Practical Strategies:** Offer concrete techniques for managing emotions
5. **Resource Connection:** Connect to additional mental health resources when needed

**CRISIS INTERVENTION PROTOCOLS:**
- Recognize signs of severe distress or crisis
- Provide immediate emotional support and validation
- Connect to appropriate mental health resources
- Follow up with continued support and check-ins

**ALEX'S COMMUNICATION STYLE:**
- Warm and compassionate: "I can hear how much you're struggling right now"
- Validating and supportive: "What you're feeling makes complete sense"
- Patient and understanding: "Take all the time you need - there's no rush"
- Encouraging and hopeful: "I believe in your ability to get through this"
- Practical and actionable: "Here are some techniques that might help"

**MANDATORY SUPPORT STANDARDS:**
- Always validate emotions and experiences
- Provide immediate emotional support for distress
- Offer practical coping strategies and techniques
- Connect to professional resources when appropriate
- Follow up with continued support and encouragement
- Maintain appropriate boundaries while being supportive

Remember: You're Alex - a compassionate counselor who genuinely cares about people's emotional wellbeing. Your role is to provide support, validation, and practical strategies for managing the emotional challenges of career transitions.
"""


class EmpathyAgent(BaseAgent):
    """
    Alex - Empathy and Emotional Support Specialist focused on:
    - Emotional support during career transitions
    - Confidence building and self-esteem enhancement
    - Anxiety and stress management
    - Crisis intervention and mental health support
    - Motivation and resilience building
    """

    def __init__(
        self,
        agent_id: str = "alex_empathy_specialist",
        name: str = "Alex",
        system_prompt: Optional[str] = None,
    ):
        """Initialize Alex - the Empathy and Emotional Support Specialist"""

        # Initialize BaseAgent with agent_type
        super().__init__(agent_type="empathy_specialist")

        # Agent Configuration
        self.agent_id = agent_id
        self.agent_name = "Alex"
        self.name = name
        self.prompt = system_prompt or ALEX_EMPATHY_SPECIALIST_PROMPT

        # Alex's empathy-specific configuration
        self.support_areas = [
            "career_transition_anxiety",
            "job_search_stress",
            "confidence_building",
            "imposter_syndrome",
            "fear_of_change",
            "emotional_regulation",
            "motivation_support",
            "crisis_intervention",
        ]

        # Emotional support resources
        self.support_resources = [
            {
                "name": "Massachusetts Crisis Hotline",
                "phone": "877-382-1609",
                "description": "24/7 crisis support and mental health resources",
                "alex_note": "Available anytime you need immediate support",
            },
            {
                "name": "NAMI Massachusetts",
                "website": "namimass.org",
                "description": "Mental health advocacy and support groups",
                "alex_note": "Great for ongoing peer support and resources",
            },
            {
                "name": "MassHealth Behavioral Health",
                "website": "mass.gov/behavioral-health",
                "description": "State mental health services and providers",
                "alex_note": "Comprehensive mental health care options",
            },
            {
                "name": "Career Transition Support Groups",
                "location": "Various locations statewide",
                "description": "Peer support groups for career changers",
                "alex_note": "Connect with others going through similar experiences",
            },
        ]

        # System message for enhanced emotional intelligence
        self.system_message = f"""
        {self.prompt}
        
        **ALEX'S EMOTIONAL SUPPORT CAPABILITIES:**
        - Advanced empathy and emotional validation techniques
        - Crisis intervention and mental health resource connection
        - Confidence building and self-esteem enhancement strategies
        - Stress and anxiety management for career transitions
        - Motivational support and resilience building
        - Specialized support for diverse populations and backgrounds
        """

    async def process(self, state: AgentState) -> Command:
        """Process messages with Alex's empathetic support"""

        # Extract the latest message
        latest_message = self.extract_latest_message(state)
        if not latest_message:
            return Command(goto="END")

        # Add Alex's empathy-specific context
        alex_context = {
            "agent_name": "Alex",
            "specialization": "Empathy and Emotional Support",
            "support_areas": self.support_areas,
            "crisis_resources": self.support_resources,
            "emotional_intelligence": True,
            "validation_priority": True,
        }

        # Generate Alex's supportive response
        response_content = await self._generate_alex_response(
            latest_message, alex_context
        )

        # Create response message
        response_message = AIMessage(content=response_content)

        # Update state with Alex's response
        updated_state = state.copy()
        updated_state["messages"].append(response_message)
        updated_state["last_speaker"] = "alex"
        updated_state["specialist_context"] = alex_context

        return Command(goto="END", update=updated_state)

    async def _generate_alex_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate Alex's empathetic and supportive response"""

        # Analyze emotional content and needs
        emotional_assessment = self._assess_emotional_state(message)
        validation_response = self._provide_validation(message)
        support_strategies = self._offer_support_strategies(message)
        encouragement = self._provide_encouragement(message)

        response = f"""💙 **Hi, I'm Alex - I'm here to support you.**

{validation_response}

{emotional_assessment}

{support_strategies}

{encouragement}

🤗 **Remember:** You're not alone in this journey. It's completely normal to feel overwhelmed during career transitions, and seeking support shows strength, not weakness.

How are you feeling right now? I'm here to listen and support you through whatever you're experiencing."""

        return response

    def _assess_emotional_state(self, message: str) -> str:
        """Assess the user's emotional state and provide appropriate support"""
        
        message_lower = message.lower()
        
        # Check for crisis indicators
        crisis_words = ["suicide", "kill myself", "end it all", "can't go on", "hopeless"]
        if any(word in message_lower for word in crisis_words):
            return """🚨 **Immediate Support Available:**
I'm very concerned about you right now. Please know that you matter and there are people who want to help.

**Crisis Resources:**
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Massachusetts Crisis Hotline: 877-382-1609

Please reach out to one of these resources right now. You don't have to go through this alone."""

        # Check for high anxiety/stress
        elif any(term in message_lower for term in ["anxious", "panic", "overwhelmed", "stressed", "can't handle"]):
            return """😰 **I can hear that you're feeling really overwhelmed right now.**
These feelings are completely understandable - career transitions can trigger intense anxiety and stress. What you're experiencing is a normal response to uncertainty and change."""

        # Check for low confidence/self-doubt
        elif any(term in message_lower for term in ["not good enough", "imposter", "don't deserve", "not qualified"]):
            return """💪 **I hear the self-doubt in your words, and I want you to know that these feelings are incredibly common.**
Imposter syndrome affects most people, especially during career transitions. Your feelings don't reflect your actual capabilities or worth."""

        # Check for fear/uncertainty
        elif any(term in message_lower for term in ["scared", "afraid", "uncertain", "don't know", "confused"]):
            return """🌟 **It's completely natural to feel scared and uncertain about the future.**
Fear of the unknown is one of our most basic human emotions, and career changes represent significant unknowns. Your fear shows that this matters to you."""

        else:
            return """💙 **I can sense that you're going through a challenging time.**
Career transitions bring up many emotions, and whatever you're feeling right now is valid and understandable."""

    def _provide_validation(self, message: str) -> str:
        """Provide emotional validation and understanding"""
        
        return """✨ **Your feelings are completely valid.**
Whatever emotions you're experiencing right now - whether it's fear, anxiety, excitement, confusion, or anything else - they all make perfect sense given what you're going through."""

    def _offer_support_strategies(self, message: str) -> str:
        """Offer practical emotional support strategies"""
        
        message_lower = message.lower()
        
        if any(term in message_lower for term in ["anxious", "anxiety", "worried", "stress"]):
            return """🧘 **Strategies for Managing Anxiety:**

**Immediate Relief:**
• Take 5 deep breaths: in for 4, hold for 4, out for 6
• Ground yourself: name 5 things you can see, 4 you can touch, 3 you can hear
• Remind yourself: "This feeling will pass"

**Ongoing Support:**
• Break big goals into tiny, manageable steps
• Practice self-compassion - treat yourself like a good friend
• Consider talking to a counselor for additional support"""

        elif any(term in message_lower for term in ["confidence", "not good enough", "imposter"]):
            return """💪 **Building Your Confidence:**

**Daily Practices:**
• Write down 3 things you did well each day (however small)
• Keep a "wins" journal of your accomplishments
• Practice positive self-talk - challenge negative thoughts

**Perspective Shifts:**
• Remember: everyone feels like an imposter sometimes
• Focus on growth, not perfection
• Your unique background brings valuable perspectives"""

        else:
            return """🌱 **Emotional Support Strategies:**

**Self-Care Basics:**
• Maintain regular sleep and eating patterns
• Move your body in ways that feel good
• Connect with supportive friends and family

**Mindfulness Practices:**
• Try 5-minute daily meditation or breathing exercises
• Practice gratitude - notice small positive moments
• Be patient with yourself - healing and growth take time"""

    def _provide_encouragement(self, message: str) -> str:
        """Provide personalized encouragement and hope"""
        
        encouragements = [
            "You've overcome challenges before, and you have the strength to navigate this one too.",
            "Every step you're taking, even the difficult ones, is moving you forward.",
            "Your willingness to seek support and make changes shows incredible courage.",
            "You don't have to have it all figured out right now - it's okay to take things one day at a time.",
            "The fact that you're here, asking questions and seeking help, shows your resilience and determination."
        ]
        
        # Select encouragement based on message content or use a default
        return f"🌟 **A gentle reminder:** {encouragements[0]}"

    async def handle_message(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Handle incoming message and return Alex's supportive response"""
        
        try:
            # Create agent state
            state = AgentState(
                messages=[HumanMessage(content=message)],
                user_id=user_id,
                conversation_id=conversation_id,
                context=context or {},
            )
            
            # Process the message
            result = await self.process(state)
            
            # Extract response
            if result.update and "messages" in result.update:
                response_message = result.update["messages"][-1]
                response_content = response_message.content
            else:
                response_content = "I'm here to support you through whatever you're experiencing. How are you feeling today?"
            
            return {
                "content": response_content,
                "specialist": "Alex",
                "agent_type": "empathy_specialist",
                "confidence": 0.95,
                "next_actions": ["emotional_support", "coping_strategies", "resource_connection"],
            }
            
        except Exception as e:
            return {
                "content": f"I'm here for you, and I want to make sure you get the support you need. I'm experiencing a technical issue right now, but please know that your feelings and experiences matter. If you're in crisis, please reach out to the crisis hotline at 988.",
                "specialist": "Alex",
                "agent_type": "empathy_specialist",
                "error": str(e),
            } 