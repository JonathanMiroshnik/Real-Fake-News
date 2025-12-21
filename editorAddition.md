## Parts of a Real News Organization (Adapted for Parody News)

1. **Sources** – Where information originates
   - Primary sources (interviews, events, press releases) – *parodied as exaggerated or absurd*
   - Secondary sources (other publications, wire services) – *used for comedic contrast*
   - Data sources (official reports, databases) – *intentionally misinterpreted*
   - Tips and leaks – *fabricated for humorous effect*

2. **Reporters/Writers** – Create initial drafts
   - Beat reporters (specialized by topic) – *knowledgeable but with comedic twist*
   - General assignment reporters – *adapt to any topic with humor*
   - Investigative journalists – *dig deep for absurd connections*
   - Columnists/opinion writers – *strong but subtle comedic voice*

3. **Editors** – Refine and improve content
   - Assignment editors (decide what to cover) – *select topics with parody potential*
   - Section editors (oversee specific topics) – *ensure consistent comedic tone*
   - Copy editors (grammar, style, comedic timing) – *polish jokes and flow*
   - Managing editors (coordinate overall coverage) – *balance humor across publication*

4. **Production** – Prepare for publication
   - Layout/designers – *visually enhance the parody*
   - Photo editors/graphic artists – *create matching absurd imagery*
   - Web producers – *optimize for engagement and shareability*
   - Social media managers – *amplify comedic reach*

5. **Publishing** – Distribution and delivery
   - Print/online publishing systems – *automated parody pipeline*
   - Content management systems – *track comedic styles and success*
   - Distribution channels (newsletters, social media) – *target humor-loving audiences*

6. **Audience/Engagement** – Reader interaction
   - Comment moderation – *encourage playful participation*
   - Analytics and feedback – *measure what makes people laugh*
   - Community management – *build parody‑loving community*

## Proposed Architecture for AI Parody News Organization

### Core Philosophy:
- **Parody through understanding**: Deep comprehension of real news enables subtle, intelligent humor
- **Style over personality**: Replace overbearing writer personalities with deliberate article styles/settings
- **Editorial refinement**: Multiple passes to improve humor quality and readability
- **Automated excellence**: Full automation while maintaining high comedic standards

### New Multi‑Agent Architecture:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Source        │     │   Reporter       │     │   Editorial     │     │   Production    │
│   Aggregator    │────▶│   (Style‑Aware)  │────▶│   Pipeline      │────▶│   & Publishing  │────▶ Published
│   (Multiple     │     │                  │     │   (Multi‑stage) │     │                 │     Parody
│   APIs/Feeds)   │     └──────────────────┘     └─────────────────┘     └─────────────────┘
└─────────────────┘
```

### Key Components:

1. **Source Manager** (`sourceService.ts`)
   - Fetches from multiple news APIs, RSS feeds, social media
   - Normalizes data into `RawNewsItem` format
   - Tags items by: topic, parody potential, seriousness level
   - **Parody twist**: Identify opportunities for comedic exaggeration

2. **Reporter Service** (`reporterService.ts`) – *REPLACES Writer Personality with Article Style*
   - **Default Style**: `general_newspaper_parody` – Most articles use this baseline style:
     - Professional newspaper tone with subtle comedic exaggeration
     - Clear structure: headline, lead, body, conclusion
     - Humor derived from logical extremes of real situations
     - No overt stylistic gimmicks – parody emerges from content
   - **Special Styles** (optional, applied to minority of articles):
     - `victorian_sensationalist` – Old‑timey language, dramatic flair
     - `corporate_bs` – Buzzword‑filled, empty‑meaning corporate speak
     - `conspiracy_theorist` – Everything is connected, hidden agendas
     - `tech_bro_hype` – Over‑optimistic, jargon‑heavy tech evangelism
     - `academic_pretentious` – Unnecessarily complex, citation‑heavy
     - `clickbait_farmer` – Outrageous headlines, shallow content
     - `nihilist_detached` – "Nothing matters" perspective on everything
     - `investment_scammer` – Trying to sell you something related
     - `local_news_earnest` – Overly sincere small‑town reporting
     - `tabloid_shock` – Sensational, celebrity‑obsessed
   - **Style Application**:
     - Default style used unless special style explicitly requested
     - Special styles triggered by: topic match, random selection (e.g., 10% of articles), or editorial decision
     - Prompt construction: Base prompt (general parody) + optional style‑specific addition
   - Each style includes:
     - **Voice guidelines**: Vocabulary, sentence structure, tone
     - **Comedic approach**: How humor is injected (exaggeration, irony, absurdity)
     - **Topic affinity**: Which news categories work best with this style
   - Reporters research multiple sources to understand the real story before parodying

3. **Editorial Pipeline** (`editorialService.ts`)
   - Multi‑stage editing process tailored for parody:
     - **Structural Editor**: Improves narrative flow, ensures joke setup/payoff
     - **Fact‑Checker (Parody)**: Verifies the *real* facts so parody has solid foundation
     - **Humor Editor**: Enhances comedic timing, adds subtle jokes, removes over‑the‑top elements
     - **Copy Editor**: Grammar, style, readability while preserving comedic voice
     - **Section Editor**: Assigns category, tags, determines prominence

4. **Production Manager** (`productionService.ts`)
   - **Style‑aware image generation**: Image prompts match article's comedic style
   - **Headline optimization**: Generate multiple headlines, select most engaging
   - **Multimedia integration**: Charts/graphics that continue the parody

5. **Publishing Orchestrator** (`publishingService.ts`)
   - Manages article state through workflow
   - Database schema for tracking pipeline progress
   - Fallback mechanisms for failed steps
   - **Quality gate**: Basic checks before publication

### Database Schema Extension:
```sql
CREATE TABLE article_pipeline (
    id TEXT PRIMARY KEY,
    raw_source_id TEXT,
    article_style TEXT DEFAULT 'general_newspaper_parody',  -- default style
    draft_content TEXT,
    editor_notes JSON,
    current_stage TEXT,  -- 'draft', 'structural_edit', 'humor_edit', 'copy_edit', 'ready'
    stage_history JSON,
    humor_score REAL,    -- Optional: AI‑assessed humor quality (0‑1)
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE article_styles (
    style_key TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    voice_guidelines TEXT,
    comedic_approach TEXT,
    example_headline TEXT,
    example_paragraph TEXT,
    is_default BOOLEAN DEFAULT FALSE  -- marks the general newspaper parody style
);
```

## Implementation Plan (Incremental)

### Phase 1: Foundation (1‑2 weeks)
1. **Create pipeline database tables** – Track article state and define styles
2. **Refactor `writeBlogPost` into separate functions** – Isolate drafting, editing, publishing
3. **Add source diversity** – Integrate 2‑3 news APIs
4. **Define article styles** – Create:
   - **General newspaper parody style** (default, used for majority of articles)
   - **5‑7 special comedic styles** (optional, for variety)
   - Configuration with `is_default` flag and style‑specific prompts

### Phase 2: Editorial Pipeline (2‑3 weeks)
1. **Implement structural editor** – LLM prompt to improve organization and add context
2. **Add humor editor** – Specialized prompt to enhance comedic elements subtly
3. **Create copy editor** – Grammar and style improvements while preserving voice
4. **Build workflow manager** – Move articles through stages automatically

### Phase 3: Production & Polish (1‑2 weeks)
1. **Enhance image generation** – Use article style and content for better prompts
2. **Implement headline generation** – Create multiple options, select best
3. **Add basic quality gate** – Simple checks (length, coherence, humor presence)

### Phase 4: Advanced Features (Future)
1. **Collaborative writing** – Multiple AI agents contribute to one story
2. **Style blending** – Mix multiple comedic styles for unique articles
3. **Audience feedback loop** – Use engagement metrics to improve humor
4. **Seasonal/thematic styles** – Holiday‑themed parody, current‑event‑specific styles
5. **Interactive parody** – Reader‑influenced story directions

## Immediate Code Changes (Minimal Viable)

1. **Modify `blogService.ts`:**
   - Break `writeBlogPost` into `createDraft(newsItem, style = 'general_newspaper_parody')`, `editArticle(draft)`, `finalizeArticle(edited)`
   - Style selection: default style unless special style triggered (topic match, random 10%)
   - Prompt construction: base general parody prompt + optional style‑specific addition

2. **Create `editorialService.ts`:**
   - Basic editing prompts that focus on:
     - Improving informativeness (understand the real story)
     - Enhancing subtle humor (not overbearing)
     - Maintaining consistent style voice
   - Multi‑stage editing functions: `structuralEdit()`, `humorEdit()`, `copyEdit()`

3. **Create `styleService.ts`:**
   - Manage article styles configuration (general + special styles)
   - Provide style‑specific prompt additions
   - Determine when to apply special styles (topic affinity, random selection)
   - Mark default style with `is_default`

4. **Update `scheduler.ts`:**
   - Use new pipeline instead of direct `writeBlogPost`
   - Incorporate style‑aware article generation

## Quality Scoring Alternative

Instead of complex quality scoring, implement **humor presence detection**:
- Simple LLM call: "Does this article contain subtle, intelligent humor? (yes/no)"
- Basic coherence check: "Is this article readable and logically structured?"
- Fallback: If article fails basic checks, regenerate or discard

## Benefits of This Approach

1. **Better Humor**: Multiple refinement stages improve comedic quality and subtlety
2. **Style Variety**: Readers enjoy different comedic approaches without personality fatigue
3. **Professional Feel**: Mimics real editorial process for higher‑quality output
4. **Scalability**: Easy to add new styles, editors, or sources
5. **Consistency**: Articles maintain chosen style throughout
6. **Automation Preserved**: No human intervention needed, but pipeline is extensible

## Parody‑Specific Considerations

- **Truth‑to‑parody ratio**: Enough real facts to make parody recognizable
- **Subtlety over slapstick**: Intelligent humor rather than obvious jokes
- **Timing and pacing**: Comedic rhythm in article structure
- **Cultural relevance**: References that will land with the audience
- **Avoid offense**: Humor that punches up, not down

This architecture transforms the system from "single loud personality" to "professional parody newsroom" where style, editing, and production work together to create consistently funny, engaging content that respects the intelligence of both the source material and the audience.
