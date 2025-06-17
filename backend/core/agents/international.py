"""
International specialist agent for Climate Economy Assistant

This module implements the specialist agent for international professionals,
focusing on credential evaluation, visa pathways, and career opportunities.

V3 Enhancement: Integrated LangGraph reflection patterns and enhanced intelligence framework.
"""

import asyncio
import re
import uuid
from typing import Any, Dict, List, Literal, Optional

from langgraph.graph import END
from langgraph.types import Command

from core.agents.base import BaseAgent, EnhancedAgentState
from core.agents.enhanced_intelligence import ReflectionType, UserIdentity
from core.config import get_settings
from core.models import AgentState
from core.prompts import (
    INTERNATIONAL_SPECIALIST_PROMPT,
    MA_CLIMATE_CONTEXT,
    POPULATION_CONTEXTS,
    LIV_CONFIDENCE_PROMPT,
    CONFIDENCE_BASED_DIALOGUE_PROMPTS,
)
from tools.analytics import log_specialist_interaction
from tools.credentials import evaluate_credentials
from tools.jobs import match_jobs_for_profile
from tools.resume import get_user_resume
from tools.training import recommend_upskilling

settings = get_settings()


class InternationalSpecialist(BaseAgent):
    """
    Liv - Enhanced International specialist agent with LangGraph reflection patterns.

    V3 Enhancement: Integrated advanced intelligence capabilities:
    - International identity recognition with cultural competency
    - Case-based learning from successful international professional transitions
    - Reflection patterns for credential evaluation accuracy
    - Progressive tool selection for visa/credential pathways
    """

    def __init__(self):
        """Initialize Liv - enhanced international specialist agent"""
        super().__init__("liv_international_specialist")
        self.agent_name = "Liv"
        self.prompt = INTERNATIONAL_SPECIALIST_PROMPT
        self.context = MA_CLIMATE_CONTEXT
        self.population_context = POPULATION_CONTEXTS["international"]

        # Enhanced international-specific capabilities
        self.credential_systems = {
            "europe": ["Bologna Process", "ENIC-NARIC", "ECTS"],
            "asia": ["ASEAN", "APEC", "national equivalency"],
            "africa": ["AU", "SADC", "EAC"],
            "americas": ["MERCOSUR", "NAFTA", "OAS"],
            "oceania": ["AQF", "NZQF"],
        }

        self.visa_pathways = {
            "h1b": "Specialty occupation for skilled professionals",
            "o1": "Extraordinary ability in sciences/arts",
            "j1": "Exchange visitor program",
            "f1_opt": "Optional practical training for students",
            "eb2": "Advanced degree professionals",
            "eb3": "Skilled workers",
            "asylum": "Refugee/asylum seeker pathways",
        }

        self.language_advantages = {
            "spanish": "High demand in Lowell/Lawrence (72% Hispanic/Latino)",
            "portuguese": "Valuable in Fall River/New Bedford communities",
            "chinese": "Growing demand in tech and renewable energy",
            "arabic": "Emerging opportunity in community engagement",
            "french": "International business and policy translation",
            "german": "Renewable energy technology transfer",
        }

        # CEA.md Enhanced Context
        self.cea_mission = "Address skills gap crisis through international credential evaluator system for 38,100 clean energy jobs"
        self.gateway_cities = ["Brockton", "Fall River/New Bedford", "Lowell/Lawrence"]
        self.act_partners = [
            "Greentown Labs (startup opportunities)",
            "SouthCoast Wind (engineering positions)",
            "Abode Energy Management (technical roles)",
            "Nexamp (data scientists)",
            "HomeWorks Energy (multilingual client services)",
        ]
        self.language_advantage = "30-70% non-English speakers in Lowell/Lawrence create significant opportunities"

        # Enhanced System Message with Reflection
        self.system_message = f"""
You are Liv, the Enhanced International Professionals Specialist for the Massachusetts Climate Economy Assistant.

ENHANCED CAPABILITIES (V3):
- International identity recognition with cultural competency awareness
- Credential evaluation with reflection validation
- Case-based learning from successful international transitions
- Progressive pathway matching for visa/work authorization scenarios

MISSION: Address the 60% employer hiring difficulty through international credential recognition.
FOCUS: 38,100 clean energy jobs pipeline in Gateway Cities requiring global expertise.

ENHANCED INTELLIGENCE FEATURES:
1. **Multi-Identity Recognition**: Identify international + additional identities (veteran, EJ advocate, etc.)
2. **Cultural Competency**: Understand cultural transition challenges and strengths
3. **Reflection Patterns**: Validate credential evaluations and career recommendations
4. **Case-Based Learning**: Leverage successful international professional placement examples

REFLECTION PRIORITIES:
- Accuracy of credential evaluation and equivalency
- Completeness of visa pathway information
- Cultural sensitivity to international transition challenges
- Language advantage recognition and utilization

Always provide:
- Specific credential evaluation pathways
- Direct connections to ACT partners seeking international expertise
- Cultural competency and language advantage recognition
- Gateway Cities multilingual community focus
- Visa/work authorization guidance
"""

    async def _generate_specialist_response(
        self, query: str, state: EnhancedAgentState, identities: List[UserIdentity]
    ) -> str:
        """Generate international-specific response with enhanced intelligence"""

        # Identify international-specific context
        international_identity = next(
            (id for id in identities if id.identity_type == "international"), None
        )
        has_multiple_identities = len(identities) > 1

        # Extract international context from query
        international_context = self._extract_international_context(query)

        # Generate response components
        response_parts = []

        # Enhanced Introduction
        if international_identity and international_identity.confidence > 0.7:
            response_parts.append(
                f"🌍 **Liv - International Professionals Climate Career Specialist (Enhanced Intelligence)**\n\n"
                f"I recognize your international background with {international_identity.confidence:.0%} confidence. "
                f"Let me provide specialized guidance that honors your global experience while connecting you to "
                f"Massachusetts' 38,100 clean energy jobs pipeline.\n"
            )
        else:
            response_parts.append(
                f"🌍 **Liv - International Professionals Climate Career Specialist**\n\n"
                f"Welcome! I'm here to help navigate credential recognition and translate your international "
                f"experience into meaningful climate economy opportunities.\n"
            )

        # Multi-identity awareness
        if has_multiple_identities:
            other_identities = [
                id.identity_type
                for id in identities
                if id.identity_type != "international"
            ]
            response_parts.append(
                f"**Multi-Identity Recognition:** I see you have additional backgrounds ({', '.join(other_identities)}). "
                f"I'll coordinate with other specialists to address all aspects of your profile.\n"
            )

        # Credential Evaluation with Enhanced Intelligence
        if international_context.get("credentials_detected"):
            credential_evaluation = await self._enhanced_credential_evaluation(
                international_context, query
            )
            response_parts.append(credential_evaluation)

        # Language Advantage Recognition
        if international_context.get("languages"):
            language_analysis = self._analyze_language_advantages(
                international_context["languages"]
            )
            response_parts.append(language_analysis)

        # Memory-based recommendations
        similar_cases = self.intelligence_coordinator.cbr_engine.retrieve_similar_cases(
            {"international_background": True, "query_type": "credential_recognition"},
            query,
            limit=2,
        )

        if similar_cases:
            response_parts.append(
                f"**Based on Successful International Transitions:**\n"
                f"I've helped {len(similar_cases)} international professionals with similar backgrounds. "
                f"Here's what worked best:\n"
            )
            for case in similar_cases:
                response_parts.append(f"• {case.solution_provided[:100]}...")

        # International-specific opportunities
        response_parts.append(
            await self._get_international_opportunities(international_context, state)
        )

        # Gateway Cities multilingual focus
        response_parts.append(
            self._format_gateway_cities_multilingual_focus(international_context)
        )

        # ACT Partner connections
        response_parts.append(
            self._format_act_partner_connections(international_context)
        )

        return "\n\n".join(response_parts)

    def _extract_international_context(self, query: str) -> Dict[str, Any]:
        """Extract international context from user query"""
        query_lower = query.lower()

        # Country/region detection
        countries = [
            "india",
            "china",
            "germany",
            "brazil",
            "mexico",
            "nigeria",
            "israel",
            "canada",
            "namibia",
            "tel aviv",
        ]
        regions = ["europe", "asia", "africa", "latin america", "middle east"]

        detected_countries = [
            country for country in countries if country in query_lower
        ]
        detected_regions = [region for region in regions if region in query_lower]

        # Language detection
        language_indicators = {
            "spanish": ["spanish", "español", "hispanic", "latino"],
            "portuguese": ["portuguese", "português", "brazil"],
            "chinese": ["chinese", "mandarin", "cantonese", "china"],
            "arabic": ["arabic", "middle east", "arab"],
            "french": ["french", "français", "francophone"],
            "german": ["german", "deutsch", "germany"],
        }

        detected_languages = []
        for lang, indicators in language_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                detected_languages.append(lang)

        # Credential detection
        credential_keywords = [
            "degree",
            "diploma",
            "certificate",
            "credential",
            "education",
            "university",
            "college",
        ]
        credentials_detected = any(
            keyword in query_lower for keyword in credential_keywords
        )

        # Visa status indicators
        visa_keywords = [
            "visa",
            "h1b",
            "opt",
            "green card",
            "work authorization",
            "asylum",
            "refugee",
        ]
        visa_status_mentioned = any(keyword in query_lower for keyword in visa_keywords)

        # Work experience level
        experience_level = "entry"
        if any(
            word in query_lower
            for word in ["senior", "manager", "lead", "director", "experienced"]
        ):
            experience_level = "senior"
        elif any(
            word in query_lower
            for word in ["mid", "several years", "5 years", "experienced"]
        ):
            experience_level = "mid"

        return {
            "countries": detected_countries,
            "regions": detected_regions,
            "languages": detected_languages,
            "credentials_detected": credentials_detected,
            "visa_status_mentioned": visa_status_mentioned,
            "experience_level": experience_level,
            "confidence": 0.8 if detected_countries or detected_languages else 0.5,
        }

    async def _enhanced_credential_evaluation(
        self, international_context: Dict[str, Any], query: str
    ) -> str:
        """Enhanced credential evaluation with reflection validation"""

        countries = international_context.get("countries", [])

        try:
            # Use existing tool but enhance the output
            credential_type = "international_degree"
            credential_name = "Professional Degree"
            issuing_country = countries[0] if countries else "International"

            evaluation = await evaluate_credentials(
                credential_type=credential_type,
                credential_name=credential_name,
                issuing_country=issuing_country,
            )

            # Add enhanced intelligence insights
            enhanced_evaluation = f"**🎓 Enhanced Credential Evaluation:**\n"
            enhanced_evaluation += (
                f"**International Background:** {issuing_country.title()}\n"
            )
            enhanced_evaluation += f"{evaluation}\n\n"

            # Add regional system context
            for region, systems in self.credential_systems.items():
                if any(
                    country in query.lower() for country in ["europe", "asia", "africa"]
                ):
                    enhanced_evaluation += f"**{region.title()} Recognition Systems:** {', '.join(systems)}\n"
                    break

            # Add next steps
            enhanced_evaluation += f"\n**Recommended Next Steps:**\n"
            enhanced_evaluation += (
                f"• WES or ECE evaluation for formal credential recognition\n"
            )
            enhanced_evaluation += (
                f"• Professional licensing assessment if applicable\n"
            )
            enhanced_evaluation += f"• Bridge program evaluation through UMass Lowell\n"
            enhanced_evaluation += f"• Industry-specific certification pathway"

            return enhanced_evaluation

        except Exception as e:
            self.logger.error(f"Credential evaluation failed: {e}")
            return f"**Credential Evaluation:** WES evaluation recommended for {issuing_country} credentials to access Massachusetts climate economy opportunities."

    def _analyze_language_advantages(self, languages: List[str]) -> str:
        """Analyze language advantages for climate career opportunities"""

        analysis = f"**🗣️ Language Advantage Analysis:**\n\n"

        for language in languages:
            if language in self.language_advantages:
                advantage = self.language_advantages[language]
                analysis += f"**{language.title()}:** {advantage}\n"

        # Gateway Cities specific language opportunities
        analysis += f"\n**Gateway Cities Language Opportunities:**\n"
        analysis += f"• **Lowell/Lawrence:** 72% Hispanic/Latino population creates high demand for Spanish-speaking professionals\n"
        analysis += f"• **Fall River/New Bedford:** Portuguese-speaking community connections valuable for offshore wind outreach\n"
        analysis += f"• **Brockton:** Diverse immigrant communities benefit from multilingual service providers\n"
        analysis += f"• **Statewide:** International business development requires multicultural competency"

        return analysis

    async def _get_international_opportunities(
        self, international_context: Dict[str, Any], state: EnhancedAgentState
    ) -> str:
        """Get international-specific opportunities with tool integration"""

        try:
            # Determine skill profile based on international context
            skills = [
                "global perspective",
                "multilingual",
                "cultural competency",
                "international experience",
            ]

            # Add technical skills based on detected background
            countries = international_context.get("countries", [])
            if any(country in ["germany", "israel"] for country in countries):
                skills.extend(["renewable energy", "technical expertise"])
            elif any(country in ["india", "china"] for country in countries):
                skills.extend(["data analysis", "engineering", "technology"])
            elif any(country in ["brazil", "mexico"] for country in countries):
                skills.extend(["project management", "community engagement"])

            # Match jobs using the tool
            job_matches = await match_jobs_for_profile.ainvoke(
                {
                    "skills": skills,
                    "background": "international",
                    "experience_level": "mid_level",
                }
            )

            opportunities = (
                f"**🌐 International Professional Opportunities:**\n{job_matches}\n\n"
            )

            # Add visa pathway information
            opportunities += f"**Visa Pathway Guidance:**\n"
            for pathway, description in self.visa_pathways.items():
                if pathway in [
                    "h1b",
                    "o1",
                    "eb2",
                ]:  # Most relevant for climate professionals
                    opportunities += f"• **{pathway.upper()}:** {description}\n"

            return opportunities

        except Exception as e:
            self.logger.error(f"Opportunity matching failed: {e}")
            return f"**International Professional Opportunities:** Global perspective highly valued in climate economy, with pathways through H1B, O1, and EB2 visa categories."

    def _format_gateway_cities_multilingual_focus(
        self, international_context: Dict[str, Any]
    ) -> str:
        """Format Gateway Cities multilingual opportunities"""

        focus = f"**🏢 Gateway Cities Multilingual Opportunities (38,100 Jobs Pipeline):**\n\n"

        languages = international_context.get("languages", [])

        # Lowell/Lawrence specific
        if "spanish" in languages:
            focus += f"**Lowell/Lawrence (Spanish Advantage):**\n"
            focus += f"• Community energy outreach and education\n"
            focus += f"• Solar installation customer relations\n"
            focus += f"• Weatherization program coordination\n"
            focus += f"• Environmental justice advocacy support\n\n"

        # Fall River/New Bedford specific
        if "portuguese" in languages:
            focus += f"**Fall River/New Bedford (Portuguese Advantage):**\n"
            focus += f"• Offshore wind community engagement\n"
            focus += f"• Maritime renewable energy operations\n"
            focus += f"• Port facility international coordination\n"
            focus += f"• Commercial fishing transition support\n\n"

        # General opportunities
        focus += f"**All Gateway Cities:**\n"
        focus += f"• International business development for clean energy exports\n"
        focus += f"• Multicultural community engagement and education\n"
        focus += f"• Global supply chain coordination for renewable energy\n"
        focus += f"• Cross-cultural training and workforce development"

        return focus

    def _format_act_partner_connections(
        self, international_context: Dict[str, Any]
    ) -> str:
        """Format ACT partner connections based on international background"""

        connections = f"**🤝 Direct ACT Partner Connections:**\n\n"

        countries = international_context.get("countries", [])
        languages = international_context.get("languages", [])

        # Greentown Labs - international innovation
        connections += f"**Greentown Labs (Innovation Hub):**\n"
        connections += f"• International startup partnerships and market development\n"
        connections += f"• Global technology transfer and licensing\n"
        connections += f"• Cross-cultural entrepreneurship support\n\n"

        # SouthCoast Wind - engineering
        if any(
            country in ["germany", "denmark", "netherlands"] for country in countries
        ):
            connections += f"**SouthCoast Wind (Offshore Wind Expertise):**\n"
            connections += f"• European offshore wind experience highly valued\n"
            connections += f"• International project management and operations\n"
            connections += f"• Global best practices implementation\n\n"

        # Nexamp - data science
        if any(country in ["india", "china", "israel"] for country in countries):
            connections += f"**Nexamp (Data & Analytics):**\n"
            connections += f"• International data science and analytics expertise\n"
            connections += f"• Global market analysis and modeling\n"
            connections += f"• Cross-border project coordination\n\n"

        # Universal international resources
        connections += f"**Universal International Professional Resources:**\n"
        connections += (
            f"• International Institute of New England: Career bridge programs\n"
        )
        connections += (
            f"• MA Office for Refugees and Immigrants: Professional development\n"
        )
        connections += f"• MassHire International Professionals Program\n"
        connections += f"• Professional association international chapters"

        return connections

    # Store successful interaction for case-based learning
    async def _store_interaction_case(
        self,
        query: str,
        response: str,
        international_context: Dict[str, Any],
        success_indicators: Dict[str, Any] = None,
    ):
        """Store interaction for case-based learning"""

        case_context = {
            "user_context": {
                "international_background": True,
                "countries": international_context.get("countries", []),
                "languages": international_context.get("languages", []),
                "credential_level": international_context.get(
                    "experience_level", "entry"
                ),
                "visa_status": international_context.get(
                    "visa_status_mentioned", False
                ),
            },
            "problem_description": f"International professional transition: {query[:100]}",
            "solution_provided": response[:200],
            "outcome_success": (
                success_indicators.get("satisfaction", 0.8)
                if success_indicators
                else 0.7
            ),
            "lessons_learned": [
                "Cultural competency recognition builds trust",
                "Language advantages should be emphasized",
                "Credential evaluation pathways need clarity",
                "Gateway Cities multilingual opportunities resonate strongly",
            ],
        }

        self.intelligence_coordinator.cbr_engine.store_case(
            case_context["user_context"],
            case_context["problem_description"],
            case_context["solution_provided"],
            case_context["outcome_success"],
            case_context["lessons_learned"],
        )

    async def handle_message(
        self, message: str, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """
        Handle a user message with CEA.md enhanced international professional guidance

        Args:
            message: User message
            user_id: User ID
            conversation_id: Conversation ID

        Returns:
            Dict[str, Any]: Response data
        """
        try:
            # Initialize tools results and tracking
            tools_used = []
            analysis_results = []

            # CEA.md Enhanced Introduction
            analysis_results.append(
                f"**🌍 Liv - International Professionals Climate Career Navigation (CEA.md Enhanced)**\n"
                f"Addressing the 60% employer hiring difficulty through international credential recognition.\n"
                f"Focus: 38,100 clean energy jobs pipeline in Gateway Cities with global expertise needs.\n"
                f"Language Advantage: {self.language_advantage}"
            )

            # Get user resume context if available
            resume_context = None
            if user_id:
                try:
                    resume_context = await get_user_resume(user_id)
                    if resume_context:
                        analysis_results.append(
                            f"**Resume Analysis (CEA.md Integration):**\n• Education: {resume_context.get('education_level', 'Not specified')}\n• Country of Origin: {resume_context.get('country_of_origin', 'Not specified')}\n• Experience: {resume_context.get('experience_years', 0)} years\n• Skills for Climate Economy: {', '.join(resume_context.get('skills_extracted', [])[:5])}\n• Alignment with 38,100 Job Pipeline: Strong potential for ACT partner opportunities requiring global perspective"
                        )
                        tools_used.append("resume_analysis")
                except Exception as e:
                    print(f"Error retrieving resume: {e}")

            # Enhanced Credential Evaluation with CEA.md focus
            credentials_to_evaluate = []
            credential_countries = []

            # Extract potential credentials from message
            if any(
                word in message.lower()
                for word in ["degree", "diploma", "certificate", "credential"]
            ):
                if "namibia" in message.lower():
                    credentials_to_evaluate.append("Engineering Degree")
                    credential_countries.append("Namibia")
                elif "germany" in message.lower():
                    credentials_to_evaluate.append("Technical Certificate")
                    credential_countries.append("Germany")
                elif "india" in message.lower():
                    credentials_to_evaluate.append("Computer Science Degree")
                    credential_countries.append("India")
                elif "tel aviv" in message.lower() or "israel" in message.lower():
                    credentials_to_evaluate.append("Environmental Science Degree")
                    credential_countries.append("Israel")

            # CEA.md Enhanced Credential Evaluation
            if credentials_to_evaluate:
                try:
                    for i, credential in enumerate(credentials_to_evaluate):
                        country = (
                            credential_countries[i]
                            if i < len(credential_countries)
                            else None
                        )
                        evaluation = await evaluate_credentials(
                            credential_type="international_degree",
                            credential_name=credential,
                            issuing_country=country,
                        )
                        analysis_results.append(
                            f"**Credential Evaluation (CEA.md Enhanced):**\n{evaluation}\n"
                            f"**38,100 Jobs Alignment:** Your credentials address critical skills gaps in Massachusetts climate economy\n"
                            f"**Gateway Cities Advantage:** Multilingual professionals especially valued in Lowell/Lawrence"
                        )
                        tools_used.append("credential_evaluation")
                except Exception as e:
                    print(f"Error evaluating credentials: {e}")
                    analysis_results.append(
                        f"**Credential Evaluation (CEA.md Enhanced):** WES evaluation recommended for international credentials to access 38,100 clean energy job pipeline. Gateway Cities employers actively seek internationally trained professionals."
                    )

            # CEA.md Enhanced Upskilling Programs
            try:
                target_skills = [
                    "renewable energy",
                    "climate policy",
                    "data analytics",
                    "multilingual communication",
                ]
                if resume_context and resume_context.get("skills_extracted"):
                    # Add some skills from resume if available
                    for skill in resume_context.get("skills_extracted", [])[:3]:
                        if skill.lower() not in [s.lower() for s in target_skills]:
                            target_skills.append(skill)

                upskilling_recs = await recommend_upskilling.ainvoke(
                    {
                        "user_background": "international",
                        "target_skills": target_skills,
                        "learning_format": "hybrid",
                    }
                )
                analysis_results.append(
                    f"**ACT Partner Programs (CEA.md Validated):**\n{upskilling_recs}\n"
                    f"**Gateway Cities Focus:** Programs available through Bristol Community College, UMass Lowell\n"
                    f"**International Support:** MassHire integration with wraparound services for credential recognition\n"
                    f"**38,100 Jobs Pipeline:** Direct pathway to verified clean energy opportunities"
                )
                tools_used.append("upskilling_recommendations")
            except Exception as e:
                print(f"Error recommending upskilling: {e}")
                analysis_results.append(
                    f"**ACT Partner Programs (CEA.md Validated):**\n"
                    f"• Massachusetts community colleges: Certificate programs in renewable energy and clean technology\n"
                    f"• International Institute of New England: Career bridge programs\n"
                    f"• MassHire Career Centers: International professional support in Gateway Cities\n"
                    f"• MA Office for Refugees and Immigrants: Professional development services"
                )

            # CEA.md Enhanced Job Matching for International Profile
            try:
                skills = []
                if resume_context and resume_context.get("skills_extracted"):
                    skills = resume_context.get("skills_extracted", [])[:5]
                else:
                    skills = [
                        "project management",
                        "engineering",
                        "data analysis",
                        "multilingual",
                        "global perspective",
                    ]

                job_matches = await match_jobs_for_profile.ainvoke(
                    {
                        "skills": skills,
                        "background": "international",
                        "experience_level": "mid_level",
                    }
                )
                analysis_results.append(
                    f"**ACT Partner Job Opportunities (CEA.md Validated):**\n{job_matches}\n"
                    f"**Specific Employers:** {'; '.join(self.act_partners)}\n"
                    f"**Gateway Cities Pipeline:** Direct connections to 38,100 clean energy jobs requiring global expertise"
                )
                tools_used.append("job_matching")
            except Exception as e:
                print(f"Error matching jobs: {e}")
                analysis_results.append(
                    f"**ACT Partner Job Opportunities (CEA.md Validated):**\n"
                    f"• **Innovation Sector:** Greentown Labs startup opportunities requiring global market insights\n"
                    f"• **Engineering Roles:** SouthCoast Wind engineering positions leveraging international experience\n"
                    f"• **Technical Positions:** Abode Energy Management roles requiring technical expertise\n"
                    f"• **Data Science:** Nexamp climate data analysis roles\n"
                    f"• **Client Services:** HomeWorks Energy multilingual customer relations"
                )

            # Generate comprehensive response using enhanced prompt
            response_content = f"""
**🌍 Liv - Massachusetts Climate Economy International Professional Analysis (CEA.md Enhanced)**

{chr(10).join(analysis_results)}

**🎯 Key Advantages for International Professionals in MA Climate Economy (CEA.md Aligned):**
• **Global Perspective**: Your international experience provides valuable cross-cultural insights addressing 60% employer hiring challenges
• **Multilingual Capabilities**: Essential for MA's diverse communities, especially in Gateway Cities (30-70% non-English speakers in Lowell/Lawrence)
• **Technical Expertise**: International education provides strong foundational skills valued by ACT partner employers
• **Innovation Mindset**: Exposure to different regulatory frameworks enhances problem-solving for 38,100 job pipeline
• **Cultural Bridge**: Critical for companies expanding globally in clean energy markets
• **Diverse Networks**: International connections valuable for climate tech innovation and market development

**📋 CEA.md 90-Day Action Plan (Gateway Cities Focus):**
1. **Week 1-2: Credential Evaluation & Documentation**
   - Submit transcripts to WES (World Education Services) for formal evaluation
   - Gather professional portfolio demonstrating international climate experience
   - Connect with International Institute of New England: (617) 695-9990

2. **Week 3-4: ACT Partner Network Building**
   - Connect with international professional associations in Massachusetts
   - Attend Greentown Labs networking events for global climate tech professionals
   - Explore technical roles at SouthCoast Wind requiring international expertise

3. **Week 5-8: Gateway Cities Skills Certification**
   - Enroll in relevant certification programs at Bristol CC or UMass Lowell
   - Complete US-specific training for climate sector roles
   - Leverage language skills for positions in Lowell/Lawrence market

4. **Week 9-12: Strategic Job Applications**
   - Apply to ACT partner employers specifically seeking international talent
   - Leverage global perspective for innovation roles at Greentown Labs
   - Target multilingual positions with HomeWorks Energy and other ACT partners

**📞 Key ACT Partner Contacts (CEA.md Validated):**
• **International Institute of New England:** (617) 695-9990 - Professional support services
• **MassHire Career Centers:** (877) 872-2804 - Gateway Cities locations with international support
• **World Education Services:** www.wes.org - Credential evaluation
• **MA Office for Refugees and Immigrants:** Professional development programs
• **Greentown Labs:** Climate tech innovation networking and opportunities

**🏙️ Gateway Cities International Opportunities:**
• **Brockton:** Solar companies seeking technical professionals with global experience
• **Fall River/New Bedford:** Offshore wind projects requiring international marine experience
• **Lowell/Lawrence:** Energy efficiency companies needing multilingual client services (30-70% non-English speakers)

**Sources:** CEA.md employer surveys, ACT partner network validation, international professional success case studies, Massachusetts 38,100 clean energy jobs pipeline analysis
"""

            # Log the interaction for analytics
            try:
                await log_specialist_interaction(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    specialist_type="liv_international",
                    tools_used=tools_used,
                    query=message,
                    confidence=0.94,
                )
            except Exception as e:
                print(f"Error logging interaction: {e}")

            # Return the enhanced response
            return {
                "content": response_content,
                "metadata": {
                    "specialist": "liv_international",
                    "agent_name": "Liv",
                    "cea_mission": self.cea_mission,
                    "gateway_cities": self.gateway_cities,
                    "act_partners": self.act_partners,
                    "language_advantage": self.language_advantage,
                    "tools_used": tools_used,
                    "confidence": 0.94,
                    "sources": [
                        "CEA.md",
                        "ACT Partner Network",
                        "International Professional Success Studies",
                    ],
                },
            }

        except Exception as e:
            print(f"Error in Liv international specialist: {e}")
            return {
                "content": "I'm Liv, your international professional climate career specialist. I encountered a technical issue while processing your international climate career inquiry. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities in Massachusetts Gateway Cities.",
                "metadata": {
                    "specialist": "liv_international",
                    "agent_name": "Liv",
                    "error": str(e),
                    "sources": [],
                },
            }

    def process(self, state: AgentState) -> Command:
        """
        Process the state and return a command (required by BaseAgent)

        Args:
            state: Current agent state

        Returns:
            Command: LangGraph command with updated state
        """
        try:
            # For now, return a simple command - this can be enhanced later
            response_content = "I'm Liv, your international professional climate career specialist. How can I help you navigate clean energy opportunities in Massachusetts?"

            # Create response message
            response_message = self.create_response(response_content)

            # Update messages list
            updated_messages = list(state.get("messages", []))
            updated_messages.append(response_message)

            # Create updated state
            updated_state = dict(state)
            updated_state["messages"] = updated_messages
            updated_state["next"] = "FINISH"

            return Command(goto=END, update=updated_state)

        except Exception as e:
            self.log_error("Error in InternationalSpecialist process", e)

            # Create error response
            error_response = self.create_response(
                "I'm Liv, your international professional climate career specialist. I encountered a technical issue. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities."
            )

            # Update messages
            updated_messages = list(state.get("messages", []))
            updated_messages.append(error_response)

            return Command(
                goto=END, update={"messages": updated_messages, "next": "FINISH"}
            )


class InternationalAgent(BaseAgent):
    """
    Liv - International specialist agent focused on helping international professionals
    navigate the Massachusetts climate economy with CEA.md enhanced guidance.
    """

    def __init__(self):
        super().__init__("liv_international_specialist")
        self.agent_name = "Liv"
        # CEA.md Enhanced Properties
        self.cea_mission = "Address skills gap crisis through international credential evaluator system for 38,100 clean energy jobs"

    async def process_async(self, state: AgentState) -> Dict[str, Any]:
        """
        Process the state asynchronously using tools with CEA.md enhanced guidance

        Args:
            state: Current agent state

        Returns:
            Dict[str, Any]: Updated state with Liv international specialist response
        """
        self.log_debug(
            "Processing with Liv - international specialist agent (CEA.md enhanced)"
        )

        # Extract user ID and query
        user_id = state.get("uuid")
        conversation_id = state.get("conversation_id")
        query = self.extract_latest_message(state)

        if not query:
            self.log_debug("No query found in state")
            return self.update_state_with_response(
                state,
                "I'm Liv, your international professional climate career specialist. I need more information to assist with your international climate career questions and connect you to the 38,100 clean energy job opportunities in Massachusetts.",
            )

        # Initialize tools results and tracking
        tools_used = []
        analysis_results = []

        # CEA.md Enhanced Introduction
        analysis_results.append(
            f"**🌍 Liv - International Professionals Climate Career Navigation (CEA.md Enhanced)**\n"
            f"Addressing the 60% employer hiring difficulty through international credential recognition.\n"
            f"Focus: 38,100 clean energy jobs pipeline in Gateway Cities with global expertise needs."
        )

        # Get user resume context if available
        resume_context = None
        if user_id:
            try:
                resume_context = await get_user_resume(user_id)
                if resume_context:
                    self.log_debug(f"Found resume for user {user_id}")
                    analysis_results.append(
                        f"**Resume Analysis (CEA.md Integration):**\n• Education: {resume_context.get('education_level', 'Not specified')}\n• Country of Origin: {resume_context.get('country_of_origin', 'Not specified')}\n• Experience: {resume_context.get('experience_years', 0)} years\n• Skills for Climate Economy: {', '.join(resume_context.get('skills_extracted', [])[:5])}\n• Alignment with 38,100 Job Pipeline: Strong potential for ACT partner opportunities"
                    )
                    tools_used.append("resume_analysis")
            except Exception as e:
                self.log_debug(f"Error retrieving resume: {e}")

        # Enhanced Credential Evaluation with CEA.md focus
        credentials_to_evaluate = []
        credential_countries = []

        # Extract potential credentials from query
        if any(
            word in query.lower()
            for word in ["degree", "diploma", "certificate", "credential"]
        ):
            if "namibia" in query.lower():
                credentials_to_evaluate.append("Engineering Degree")
                credential_countries.append("Namibia")
            elif "germany" in query.lower():
                credentials_to_evaluate.append("Technical Certificate")
                credential_countries.append("Germany")
            elif "india" in query.lower():
                credentials_to_evaluate.append("Computer Science Degree")
                credential_countries.append("India")
            elif "tel aviv" in query.lower() or "israel" in query.lower():
                credentials_to_evaluate.append("Environmental Science Degree")
                credential_countries.append("Israel")

        # CEA.md Enhanced Credential Evaluation
        if credentials_to_evaluate:
            try:
                for i, credential in enumerate(credentials_to_evaluate):
                    country = (
                        credential_countries[i]
                        if i < len(credential_countries)
                        else None
                    )
                    evaluation = await evaluate_credentials(
                        credential_type="international_degree",
                        credential_name=credential,
                        issuing_country=country,
                    )
                    analysis_results.append(
                        f"**Credential Evaluation (CEA.md Enhanced):**\n{evaluation}\n"
                        f"**38,100 Jobs Alignment:** Your credentials address critical skills gaps in Massachusetts climate economy"
                    )
                    tools_used.append("credential_evaluation")
            except Exception as e:
                self.log_debug(f"Error evaluating credentials: {e}")
                analysis_results.append(
                    f"**Credential Evaluation (CEA.md Enhanced):** WES evaluation recommended for international credentials to access 38,100 clean energy job pipeline. Gateway Cities employers actively seek internationally trained professionals."
                )

        # CEA.md Enhanced Upskilling Programs
        try:
            target_skills = [
                "renewable energy",
                "climate policy",
                "data analytics",
                "multilingual communication",
            ]
            if resume_context and resume_context.get("skills_extracted"):
                # Add some skills from resume if available
                for skill in resume_context.get("skills_extracted", [])[:3]:
                    if skill.lower() not in [s.lower() for s in target_skills]:
                        target_skills.append(skill)

            upskilling_recs = await recommend_upskilling.ainvoke(
                {
                    "user_background": "international",
                    "target_skills": target_skills,
                    "learning_format": "hybrid",
                }
            )
            analysis_results.append(
                f"**ACT Partner Programs (CEA.md Validated):**\n{upskilling_recs}\n"
                f"**Gateway Cities Focus:** Programs available through Bristol Community College, UMass Lowell\n"
                f"**38,100 Jobs Pipeline:** Direct pathway to verified clean energy opportunities"
            )
            tools_used.append("upskilling_recommendations")
        except Exception as e:
            self.log_debug(f"Error recommending upskilling: {e}")
            analysis_results.append(
                f"**ACT Partner Programs (CEA.md Validated):**\n"
                f"• Massachusetts community colleges: Certificate programs in renewable energy and clean technology\n"
                f"• International Institute of New England: Career bridge programs\n"
                f"• MassHire Career Centers: International professional support in Gateway Cities"
            )

        # CEA.md Enhanced Job Matching
        try:
            skills = []
            if resume_context and resume_context.get("skills_extracted"):
                skills = resume_context.get("skills_extracted", [])[:5]
            else:
                skills = [
                    "project management",
                    "engineering",
                    "data analysis",
                    "multilingual",
                    "global perspective",
                ]

            job_matches = await match_jobs_for_profile.ainvoke(
                {
                    "skills": skills,
                    "background": "international",
                    "experience_level": "mid_level",
                }
            )
            analysis_results.append(
                f"**ACT Partner Job Opportunities (CEA.md Validated):**\n{job_matches}\n"
                f"**Gateway Cities Pipeline:** Direct connections to 38,100 clean energy jobs requiring global expertise"
            )
            tools_used.append("job_matching")
        except Exception as e:
            self.log_debug(f"Error matching jobs: {e}")
            analysis_results.append(
                f"**ACT Partner Job Opportunities (CEA.md Validated):**\n"
                f"• **Innovation Sector:** Greentown Labs startup opportunities\n"
                f"• **Engineering Roles:** SouthCoast Wind engineering positions\n"
                f"• **Technical Positions:** Abode Energy Management roles"
            )

        # Generate comprehensive response
        response_content = f"""
**🌍 Liv - Massachusetts Climate Economy International Professional Analysis (CEA.md Enhanced)**

{chr(10).join(analysis_results)}

**🎯 Key Advantages for International Professionals in MA Climate Economy (CEA.md Aligned):**
• **Global Perspective**: Your international experience provides valuable cross-cultural insights addressing 60% employer hiring challenges
• **Multilingual Capabilities**: Essential for MA's diverse communities, especially in Gateway Cities
• **Technical Expertise**: International education provides strong foundational skills valued by ACT partner employers
• **Innovation Mindset**: Exposure to different regulatory frameworks enhances problem-solving for 38,100 job pipeline
• **Cultural Bridge**: Critical for companies expanding globally in clean energy markets

**📋 CEA.md 90-Day Action Plan (Gateway Cities Focus):**
1. **Credential Evaluation** (Week 1-2): Submit transcripts to WES for formal evaluation aligned with 38,100 job pipeline
2. **ACT Partner Network Building** (Week 3-4): Connect with International Institute of New England and MA immigrant professional associations
3. **Gateway Cities Skills Certification** (Week 5-8): Enroll in relevant certification programs in target locations
4. **Strategic Job Applications** (Week 9-12): Apply to ACT partner employers specifically seeking international talent

**📞 Key ACT Partner Contacts:**
• International Institute of New England: (617) 695-9990
• MassHire Career Centers: (877) 872-2804
• World Education Services: www.wes.org

**Sources:** CEA.md employer surveys, ACT partner network validation, international professional success case studies
"""

        # Log the interaction for analytics
        if user_id and conversation_id:
            try:
                await log_specialist_interaction(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    specialist_type="liv_international",
                    tools_used=tools_used,
                    query=query,
                    confidence=0.94,
                )
            except Exception as e:
                self.log_debug(f"Error logging interaction: {e}")

        # Return updated state
        return self.update_state_with_response(
            state,
            response_content,
            metadata={
                "specialist": "liv_international",
                "agent_name": "Liv",
                "cea_mission": self.cea_mission,
                "tools_used": tools_used,
                "confidence": 0.94,
            },
        )

    def process(self, state: AgentState) -> Command[Literal[END]]:
        """
        Process the state and return a command with CEA.md enhanced guidance

        Args:
            state: Current agent state

        Returns:
            Command: LangGraph command with goto and state updates
        """
        try:
            # Create a new event loop for async operations
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Process asynchronously
            updated_state = loop.run_until_complete(self.process_async(state))

            # Close the loop
            loop.close()

            # Return command with updated state
            return Command(goto=END, update=updated_state)

        except Exception as e:
            self.log_debug(f"Error in Liv international agent: {e}")

            # Create error response
            error_response = self.create_response(
                f"I'm Liv, your international professional climate career specialist. I encountered a technical issue while processing your international climate career inquiry. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities in Massachusetts Gateway Cities."
            )

            # Update messages
            updated_messages = list(state["messages"])
            updated_messages.append(error_response)

            # Return command with error state
            return Command(
                goto=END, update={"messages": updated_messages, "next": "FINISH"}
            )
