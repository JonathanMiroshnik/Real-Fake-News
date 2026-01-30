# Horoscope & Astrology Integration - Feature Specification

## Branch: `feature/horoscope-astrology`

### Overview
Add an interactive horoscope section to the Real Fake News website, blending astrology with fake news satire. This feature will provide daily fake predictions based on planetary positions, with an interactive visualizer and AI-generated content.

### Core Components

#### 1. Homepage Horoscope Widget
- **Location:** Right sidebar or dedicated section on homepage
- **Content:** Daily horoscope for all zodiac signs (2-3 sentences each)
- **Interaction:** Click to expand to full horoscope page
- **Design:** Card-based with zodiac icons, subtle animation

#### 2. Full Horoscope Page
- **Route:** `/horoscope` or `/astrology`
- **Layout:**
  - Date selector (past/future dates for "predictions")
  - Zodiac sign selector
  - Detailed daily/weekly horoscope (200-300 words per sign)
  - "Planetary Influences" section explaining current astrological events
- **Content Generation:** LLM-generated based on real planetary data

#### 3. Interactive Planet Visualizer
- **Technology:** Three.js or D3.js for 3D/2D visualization
- **Features:**
  - Solar system visualization with planetary positions
  - **Fake Planet:** "Slopicon" - a satirical addition to the solar system
  - Clickable planets showing astrological significance
  - Date slider to show planetary movements
  - Color-coded planets (realistic colors with satirical adjustments)
- **Data Source:** Astrology API for real planetary positions

#### 4. Astrology API Integration
- **Primary API:** Swiss Ephemeris or similar astrology calculation API
- **Data Points:**
  - Planetary positions (longitude, latitude)
  - Retrograde status
  - Aspects between planets
  - House positions
- **Caching:** Daily cache of planetary data to reduce API calls

#### 5. RAG System for Astrology Content
- **Knowledge Base:** Public domain astrology books, Wikipedia articles
- **Implementation:** Vector database (ChromaDB, Pinecone) with embeddings
- **Use Case:** Enhance LLM responses with "authentic" astrological references
- **Satire Twist:** Include absurd or contradictory sources

### Technical Requirements

#### Frontend
- **New Components:**
  - `HoroscopeWidget.jsx` - Homepage widget
  - `HoroscopePage.jsx` - Full page component
  - `PlanetVisualizer.jsx` - Interactive visualization
  - `ZodiacSelector.jsx` - Sign selection interface
- **Dependencies:** Three.js (or D3.js), date-fns, charting library

#### Backend
- **New API Endpoints:**
  - `GET /api/horoscope/daily` - Get daily horoscopes
  - `GET /api/horoscope/:sign/:date` - Get specific horoscope
  - `GET /api/planetary-positions` - Get current planetary data
  - `POST /api/horoscope/generate` - Admin endpoint to generate new horoscopes
- **Services:**
  - `HoroscopeGeneratorService` - LLM integration for content
  - `AstrologyDataService` - API integration and calculations
  - `RAGService` - Knowledge retrieval for astrology

#### Database
- **New Collections/Tables:**
  - `horoscopes` - Store generated horoscope content
  - `planetary_data` - Cache of planetary positions
  - `user_horoscope_interactions` - Track user engagement

#### External Integrations
- **Astrology API:** Swiss Ephemeris or similar
- **LLM Provider:** DeepSeek/OpenAI for content generation
- **Vector Database:** For RAG system

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up astrology API integration
- Create basic horoscope generation pipeline
- Implement database schema
- Build simple horoscope page without visualization

#### Phase 2: Visualization (Week 3-4)
- Develop planet visualizer component
- Integrate Three.js/D3.js
- Add date selection functionality
- Implement clickable planet descriptions

#### Phase 3: Enhancement (Week 5-6)
- Add RAG system for astrology knowledge
- Improve LLM prompts for better satire
- Add homepage widget
- Implement caching and performance optimizations

#### Phase 4: Polish (Week 7-8)
- Mobile responsiveness
- Animation and UI polish
- A/B testing of different satire approaches
- Analytics integration

### Satire Elements

1. **Exaggerated Predictions:** Wildly improbable "predictions" tied to current events
2. **Fake Planet "Slopicon":** A planet that "causes" internet slop and AI content
3. **Corporate Astrology:** "Mercury in retrograde affects your stock portfolio"
4. **Celebrity Horoscopes:** Fake predictions about real celebrities
5. **Historical Revisionism:** "What the stars predicted for historical events"

### Integration Points

#### With Existing News System
- Horoscope "articles" can appear in news feeds
- Cross-reference with current news topics
- Share functionality to social media

#### With User System
- Save favorite horoscopes
- Share to comments section
- Personalize based on birth date (optional)

### Success Criteria

#### Technical
- Page load time < 3 seconds
- Visualizer runs at 60fps on modern devices
- API response time < 500ms
- Mobile-responsive design

#### Content
- Daily horoscope generation automated
- Planetary data accuracy (for satire credibility)
- Engaging, humorous content

#### User Engagement
- 30% of visitors interact with horoscope features
- Average time on horoscope page > 2 minutes
- Social shares of horoscope content

### Risks & Mitigations

1. **API Costs:** Astrology APIs may have costs - implement caching
2. **Performance:** 3D visualization heavy - implement lazy loading
3. **Content Quality:** LLM may produce bland content - fine-tune prompts
4. **Mobile Performance:** Simplify visualization for mobile

### Dependencies
- Existing LLM integration infrastructure
- User authentication system (for personalized features)
- Image generation pipeline (for planet/constellation images)

### Testing Strategy
- Unit tests for astrology calculations
- Integration tests for API endpoints
- Visual regression tests for planet visualizer
- User testing for humor/satire effectiveness

### Deployment Plan
1. Deploy backend API endpoints
2. Deploy frontend components behind feature flag
3. Enable for 10% of users, gather feedback
4. Full rollout after successful testing

---
*Last Updated: 30/01/2026*  
*Spec Version: 1.0*