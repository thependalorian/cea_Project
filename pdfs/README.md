# Climate Economy Domain Knowledge PDFs

This directory contains PDF documents that serve as domain knowledge for the climate economy ecosystem AI agents. These documents are processed and chunked using AI-optimized strategies for better retrieval and agent understanding.

## Expected PDF Files

### 1. NECEC_2023_Annual_Report.pdf
- **Title**: NECEC 2023 Annual Report  
- **Domain**: policy
- **Topics**: clean_energy_economy, massachusetts_policy, energy_transition
- **Description**: Comprehensive annual report on New England Clean Energy Council activities and clean energy economy growth
- **Source**: New England Clean Energy Council

### 2. Powering_the_Future_A_Massachusetts_Clean_Energy_Workforce_Needs_Assessment_Final.pdf
- **Title**: Powering the Future: A Massachusetts Clean Energy Workforce Needs Assessment
- **Domain**: workforce
- **Topics**: clean_energy_jobs, skills_gap, workforce_development  
- **Description**: Detailed workforce analysis identifying skill gaps and training needs in Massachusetts clean energy sector
- **Source**: Massachusetts Clean Energy Center

## Processing Information

- **Chunking Strategy**: AI-optimized semantic and structured chunking
- **Chunk Size**: 1500 characters with 200 character overlap
- **Embeddings**: OpenAI text-embedding-3-small
- **Content Types**: Structured (sections) and narrative content
- **Metadata**: Enhanced with section titles, chunk types, and domain classification

## Usage

Place the PDF files in this directory and run the seed partners script:

```bash
cd scripts/
python create_seed_partners.py
```

The script will:
1. Check for PDF files in this directory
2. Extract text content from each PDF
3. Apply AI-optimized chunking strategies
4. Generate embeddings for each chunk
5. Store chunks in the knowledge_resources table
6. Create searchable metadata for AI agent retrieval

## File Status

❌ **NECEC_2023_Annual_Report.pdf** - Not yet added
❌ **Powering_the_Future_A_Massachusetts_Clean_Energy_Workforce_Needs_Assessment_Final.pdf** - Not yet added

## Next Steps

1. Obtain the PDF files from their respective sources
2. Place them in this directory
3. Re-run the setup script to process domain knowledge
4. Verify knowledge base population in Supabase

## AI Agent Integration

These processed documents will serve as:
- **Policy Context**: Understanding Massachusetts clean energy policies and initiatives
- **Workforce Intelligence**: Data-driven insights on skill gaps and training needs
- **Strategic Guidance**: Industry trends and growth projections
- **Resource Discovery**: Comprehensive knowledge for agent-powered recommendations 