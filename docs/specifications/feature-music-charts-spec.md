# AI-Generated Music Charts - Feature Specification

## Branch: `feature/music-charts`

### Overview
Create a music charts section with completely AI-generated music and satirical commentary. This feature parodies music industry charts by generating fictional artists, songs, and streaming metrics using LLMs and audio generation models.

### Core Components

#### 1. Music Charts Dashboard
- **Route:** `/music-charts` or `/charts`
- **Layout:**
  - Top 10 weekly chart with rankings
  - "Viral" section for trending songs
  - Genre-specific charts (Pop, Rock, Electronic, "AI Slop")
  - Historical chart data visualization
- **Interactive Elements:**
  - Play/pause audio previews
  - "Like" and "Share" buttons
  - Artist profile links
  - Chart position changes (↑↓ arrows)

#### 2. AI Music Generation System
- **Audio Generation:** Bark, MusicGen, or similar TTS/audio models
- **Content Types:**
  - 30-second song previews
  - Artist interview snippets
  - "Live performance" audio clips
- **Metadata Generation:**
  - Song titles (LLM-generated with satire)
  - Artist names and bios
  - Album concepts and cover art descriptions
  - "Producer" credits (AI model names as producers)

#### 3. Artist Profiles & Personas
- **Profile Pages:** `/artist/:artistId`
- **Content per Artist:**
  - AI-generated biography (absurd backstories)
  - Discography with fake album releases
  - "Influences" (other AI artists, real artists parodied)
  - Social media presence simulation
  - "Controversies" (satirical drama)
- **Artist Categories:**
  - "Virtuoso Bots" (classical AI)
  - "Slop Stars" (mainstream pop parody)
  - "Experimental Algorithms" (avant-garde)
  - "Corporate Synths" (sellout artists)

#### 4. Chart Analytics & Metrics
- **Fake Streaming Data:**
  - "Streams" (randomized with trends)
  - "Downloads" (purchase simulation)
  - "Social Media Buzz" score
  - "AI Appreciation" metric
- **Trend Algorithms:**
  - Simulate viral growth patterns
  - "Industry plant" detection (satirical)
  - Chart manipulation narratives

#### 5. Music Journalism Parody
- **"Chart Analysis" Articles:**
  - Weekly chart commentary
  - Artist "breakdown" pieces
  - Genre trend reports
- **Review System:**
  - AI-generated song reviews
  - "Critic scores" (randomized with bias)
  - User review parody (bot-generated)

### Technical Requirements

#### Frontend
- **New Components:**
  - `MusicChartsPage.jsx` - Main charts dashboard
  - `ArtistProfilePage.jsx` - Artist detail view
  - `AudioPlayerWidget.jsx` - Embedded audio player
  - `ChartVisualization.jsx` - Data visualization for trends
  - `GenreSelector.jsx` - Filter by music genre
- **Dependencies:** Waveform visualizer library, audio player component, charting library

#### Backend
- **New API Endpoints:**
  - `GET /api/music-charts/:date` - Get chart data for date
  - `GET /api/artist/:id` - Get artist profile
  - `GET /api/song/:id/audio` - Stream audio preview
  - `POST /api/music/generate` - Admin endpoint to generate new content
  - `GET /api/music-trends` - Get trend analysis
- **Services:**
  - `MusicGenerationService` - Audio and metadata generation
  - `ChartCalculationService` - Fake metric calculations
  - `ArtistPersonaService` - Maintain consistent artist personas
  - `MusicJournalismService` - Generate articles and reviews

#### Database
- **New Collections/Tables:**
  - `artists` - AI-generated artist profiles
  - `songs` - Song metadata and audio references
  - `chart_positions` - Historical chart data
  - `music_reviews` - Generated reviews and articles
  - `user_music_interactions` - Likes, plays, shares

#### External Integrations
- **Audio Generation:** Bark API, MusicGen API, or local model
- **LLM Provider:** For text content generation
- **Image Generation:** For album covers and artist photos
- **CDN:** For audio file hosting

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up audio generation pipeline (test with sample outputs)
- Create database schema for artists and songs
- Build basic charts page with static data
- Implement audio player component

#### Phase 2: Content Generation (Week 3-4)
- Develop LLM prompts for artist/song generation
- Create batch generation system for initial dataset
- Implement artist profile pages
- Add basic chart visualization

#### Phase 3: Interactivity (Week 5-6)
- Add user interaction (likes, plays)
- Implement trend algorithms
- Create music journalism content system
- Add genre filtering and search

#### Phase 4: Polish & Scale (Week 7-8)
- Performance optimization for audio streaming
- Mobile responsiveness
- Analytics integration
- Content refresh scheduling

### Satire Elements

1. **Industry Parody:**
   - "Payola" exposed as "Algorithmic favoritism"
   - "Streaming farms" as "Server cluster appreciation"
   - "Ghostwriting" as "LLM collaboration"

2. **Artist Absurdities:**
   - Artists with impossible backstories (born in metaverse, etc.)
   - "Feuds" between AI models (GPT-4 vs. Claude)
   - "Creative differences" explained as parameter tuning

3. **Chart Manipulation:**
   - "Organic growth" vs. "Prompt-engineered virality"
   - "Chart rules" that parody real industry practices
   - "Award shows" with categories like "Best Use of Tokens"

4. **Music Criticism Parody:**
   - Overly technical reviews discussing "latent space harmony"
   - "Hot takes" on AI music ethics (written by AI)
   - "Year-end lists" of "most impactful model outputs"

### Integration Points

#### With Existing News System
- Music chart articles appear in news feed
- Artist "interviews" as news pieces
- Chart updates as breaking news alerts

#### With User System
- User playlists (curated AI songs)
- "Following" artists
- Sharing songs to comments/social

#### With Horoscope Feature
- "Musical horoscope" - what AI artists you should listen to based on zodiac
- Planet influences on music trends (satirical)

### Success Criteria

#### Technical
- Audio streaming with < 2 second load time
- Chart page load < 3 seconds
- Generate 100+ unique artists with 500+ songs
- Daily content generation automated

#### Content Quality
- Audio previews are listenable (not just noise)
- Artist personas are consistent and amusing
- Chart narratives are engaging and humorous

#### User Engagement
- 25% of visitors interact with music features
- Average time on charts page > 90 seconds
- Social shares of songs/artists

### Risks & Mitigations

1. **Audio Generation Quality:** Current models may produce low-quality audio - use short previews, focus on satire over audio fidelity
2. **Content Volume:** Need substantial dataset - implement batch generation, reuse elements creatively
3. **Performance:** Audio streaming bandwidth - implement compression, CDN, lazy loading
4. **Copyright:** Even AI-generated music may have copyright issues - use fully original generation, avoid sampling

### Dependencies
- Existing LLM infrastructure
- Audio processing capabilities (server-side or API)
- Image generation for album art
- User authentication system

### Testing Strategy
- Audio quality testing (subjective but guided)
- LLM output consistency tests
- Performance testing for audio streaming
- User testing for humor/satire effectiveness

### Deployment Plan
1. Deploy with limited dataset (50 artists)
2. Enable behind feature flag for internal testing
3. Gradual rollout with monitoring of server load
4. Full public release after performance validation

---
*Last Updated: 30/01/2026*  
*Spec Version: 1.0*