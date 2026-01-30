# Multi-LLM Featured Articles & Prediction Markets - Feature Specification

## Branch: `feature/featured-articles-prediction`

### Overview
Enhance article generation with multi-agent LLM systems and integrate prediction market satire, creating sophisticated content generation pipelines that parody financial analysis, expert commentary, and media sensationalism.

### Core Components

#### 1. Featured Articles System
- **Article Types:**
  1. **Expert Carousel:** Multiple "experts" (LLM personas) comment on a topic
  2. **Debate:** Two LLM personas argue opposing sides formally
  3. **Interview:** Interviewer LLM questions "expert" LLM
  4. **Man on the Street:** Multiple "everyperson" perspectives on topic
  5. **Roundtable:** 3-5 LLM personas discuss topic informally
- **Generation Pipeline:**
  - Topic selection from current news
  - Persona assignment (based on topic expertise parody)
  - Multi-turn LLM conversation generation
  - Editing and formatting for publication
  - Background image generation matching theme

#### 2. LangGraph/LangChain Multi-Agent System
- **Agent Architecture:**
  - **Orchestrator Agent:** Manages conversation flow
  - **Persona Agents:** Specialized LLM instances with distinct personalities
  - **Editor Agent:** Refines and formats final output
  - **Fact-Checker Agent:** Satirical "fact-checking" that adds absurd corrections
- **Conversation Patterns:**
  - Debate: Thesis → Antithesis → Synthesis (parody)
  - Interview: Question → Elaborate Answer → Follow-up
  - Roundtable: Free-flowing with moderator intervention
- **State Management:** Track conversation history, persona consistency

#### 3. Prediction Market Narrative Integration
- **Market Data Simulation:**
  - Fake prediction market odds for news events
  - "Trader" commentary (LLM-generated)
  - Price movement narratives tied to news developments
  - "Insider trading" satire (bots with "inside information")
- **Integration with Articles:**
  - Sidebar showing relevant prediction market odds
  - "Market implications" section in articles
  - Trader interviews as content type
- **Satirical Metrics:**
  - "Slop Index" - How much AI content affects markets
  - "Hype Coefficient" - Media sensationalism measure
  - "Reality Discount" - How unlikely predictions are priced

#### 4. Twitter/Shitpost Integration
- **Content Curation:**
  - Fetch tweets related to article topics
  - LLM filtering for "funny shitposts"
  - Integration as pull-quotes or sidebars
- **Bot Twitter Personas:**
  - LLM-generated tweet threads about articles
  - Satirical influencer commentary
  - "Twitter debates" mirrored in comments
- **Visual Integration:**
  - Tweet embeds with custom styling
  - "Twitterverse reaction" summaries
  - Hashtag trend visualization

#### 5. Advanced Background Generation
- **Thematic Backgrounds:** AI-generated images matching article themes
- **Style Variations:**
  - Roman crypto aesthetic for finance articles
  - Cyberpunk for tech articles
  - Renaissance for culture articles
  - Corporate minimalist for business articles
- **Implementation:** Stable Diffusion/DALL-E with style prompts
- **Performance:** Lazy loading, compression, CDN delivery

#### 6. Source & Reference System
- **Wikipedia Integration:** Relevant article links
- **Previous Article Linking:** Connect related stories over time
- "Further Reading" with satirical suggestions
- **Citation Style:** Parody of academic/journalistic citations

### Technical Requirements

#### Frontend
- **New Components:**
  - `FeaturedArticleLayout.jsx` - Special layout for featured articles
  - `PersonaIndicator.jsx` - Show LLM persona information
  - `PredictionMarketSidebar.jsx` - Market odds display
  - `TweetEmbed.jsx` - Custom styled tweet displays
  - `BackgroundImageLoader.jsx` - Thematic background management
  - `MultiAgentConversationView.jsx` - Display structured debates/interviews
- **Dependencies:** LangGraph.js visualization, tweet embedding library, image lazy loading

#### Backend
- **New API Endpoints:**
  - `POST /api/featured-articles/generate` - Generate new featured article
  - `GET /api/prediction-markets/:topic` - Get market data for topic
  - `POST /api/twitter/curate` - Curate tweets for topic
  - `GET /api/personas` - Get available LLM personas
  - `POST /api/backgrounds/generate` - Generate article background
- **Services:**
  - `MultiAgentOrchestrationService` - LangGraph.js integration
  - `PredictionMarketSimulationService` - Generate fake market data
  - `TwitterCurationService` - Tweet fetching and filtering
  - `PersonaManagementService` - Maintain consistent LLM personas
  - `BackgroundGenerationService` - Image generation pipeline

#### Database
- **New Collections/Tables:**
  - `featured_articles` - Multi-agent generated content
  - `llm_personas` - Persona definitions and histories
  - `prediction_markets` - Simulated market data
  - `tweet_curations` - Curated tweet collections
  - `conversation_graphs` - LangGraph state storage
  - `background_images` - Generated article backgrounds

#### External Integrations
- **LangGraph.js:** Multi-agent conversation management
- **Twitter API:** Tweet fetching (or alternative)
- **Image Generation API:** Stable Diffusion/DALL-E/Novita.ai
- **Wikipedia API:** For reference links
- **LLM Providers:** Multiple for persona diversity

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up LangGraph.js infrastructure
- Create basic multi-agent conversation system
- Implement database schema for featured articles
- Build simple featured article display

#### Phase 2: Content Generation (Week 3-4)
- Develop LLM personas and conversation patterns
- Create prediction market simulation
- Implement Twitter curation system
- Add background image generation

#### Phase 3: Integration (Week 5-6)
- Integrate featured articles into main news feed
- Add prediction market sidebars to articles
- Implement tweet embeds and curation
- Create article type selection UI

#### Phase 4: Polish & Scale (Week 7-8)
- Performance optimization for multi-agent generation
- Mobile responsiveness for complex layouts
- Analytics for engagement with featured content
- Content scheduling and automation

### Satire Elements

1. **Expert Parody:**
   - Overly specific fake credentials ("PhD in Slop Economics")
   - Contradictory expert opinions on same topic
   - "Former industry insiders" with absurd backgrounds

2. **Prediction Market Satire:**
   - Markets for impossible events
   - "Insider trading" by AI bots
   - Economic analysis of slop markets
   - "Bubble" predictions about AI content

3. **Media Sensationalism:**
   - Clickbait headlines generated by LLM
   - "Breaking news" alerts for trivial updates
   - "Exclusive" interviews with AI personas
   - "Investigative journalism" into absurd topics

4. **Twitter Integration Satire:**
   - "Twitter drama" between AI personas
   - Hashtag activism for ridiculous causes
   - Influencer culture parody through AI
   - "Viral" tweets that are obviously bot-generated

### Integration Points

#### With Existing News System
- Featured articles appear in prominent positions
- Prediction market data enhances regular articles
- Twitter reactions shown alongside articles
- Background themes applied to all article types

#### With Comments System
- Featured articles generate more bot/human discussion
- Prediction markets become debate topics
- Twitter integration feeds comment section

#### With Other Features
- **Horoscope:** Prediction markets for astrological events
- **Music Charts:** Markets for chart positions
- **Comments:** Expert personas also comment on articles

### Success Criteria

#### Technical
- Featured article generation < 2 minutes
- Page load with background images < 4 seconds
- Twitter curation < 30 seconds
- Multi-agent conversations maintain persona consistency

#### Content Quality
- Featured articles are engaging and humorous
- Personas are distinct and memorable
- Prediction market narratives are creative
- Twitter integration adds value not noise

#### User Engagement
- 50% higher engagement on featured articles vs regular
- Average time on featured articles > 5 minutes
- Social shares of featured content 2x regular
- Return visits specifically for featured content

### Risks & Mitigations

1. **Generation Complexity:** Multi-agent systems can fail or produce nonsense - implement fallbacks, human-in-the-loop for quality control
2. **API Costs:** Multiple LLM calls and image generation expensive - implement caching, rate limiting, cost monitoring
3. **Performance:** Complex pages may load slowly - implement lazy loading, progressive enhancement
4. **Content Coherence:** Multi-turn conversations may lose coherence - implement consistency checks, conversation state management

### Dependencies
- LangGraph.js/LangChain infrastructure
- Multiple LLM provider access
- Image generation API
- Twitter API access (or alternative)
- Existing article generation pipeline

### Testing Strategy
- Multi-agent conversation coherence testing
- Persona consistency across articles
- Performance testing for generation pipelines
- User testing for engagement and humor

### Deployment Plan
1. Deploy with single featured article type (Expert Carousel)
2. Gradually add more article types based on performance
3. Enable prediction markets on 20% of articles initially
4. Full feature rollout after positive metrics

---
*Last Updated: 30/01/2026*  
*Spec Version: 1.0*