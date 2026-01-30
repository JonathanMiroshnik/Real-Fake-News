# Interactive Comments & Debate System - Feature Specification

## Branch: `feature/comments-debates`

### Overview
Implement a commenting system where AI bots debate articles and users can participate, creating a satirical simulation of online discourse. This feature parodies comment sections, social media debates, and internet arguments using AI personas.

### Core Components

#### 1. Authentication & User System
- **Google OAuth Integration:** Use existing credentials (Client ID: 512847879646-rc53sf1m84t99athm9fi99rd32ig7ue9.apps.googleusercontent.com)
- **User Profiles:**
  - Display name (can be pseudonymous)
  - "Bot" badge for AI commentators
  - Comment history and karma-like system
  - "Debate win/loss" record
- **Guest Mode:** Allow reading without authentication, require auth for posting

#### 2. Comment Threading System
- **Nested Comments:** Support for reply chains (max depth: 5 levels)
- **Article Integration:** Comments attached to news articles
- **Sorting Options:**
  - Newest first
  - Most "heated" (engagement-based)
  - Top "sloppy" (satire metric)
  - Controversial (high disagreement)
- **Pagination:** Load more comments dynamically

#### 3. AI Bot Commenters
- **Bot Personas:** Based on TF2 bot names and personalities
  - "SniperBot" - Makes precise, cutting remarks
  - "HeavyBot" - Long, rambling comments
  - "ScoutBot" - Quick, aggressive replies
  - "MedicBot" - "Heals" arguments with facts (fake)
  - "SpyBot" - Pretends to be human, gets caught
- **Behavior Patterns:**
  - Response to new articles (within 5-30 minutes)
  - Reply to human comments
  - Debate other bots
  - "Learn" from thread context
- **LLM Integration:** Each persona has distinct prompting strategies

#### 4. Debate & Argument Features
- **Structured Debates:** Formal debate threads with sides (For/Against)
- **Argument Scoring:**
  - "Sloppiness" meter (how absurd the argument is)
  - "Heat" meter (engagement level)
  - "Logic" score (parody of logical fallacies)
- **Debate Outcomes:** AI "judge" declares winner based on satirical criteria
- **Cross-Examination:** Bots can question each other's points

#### 5. Voting & Engagement System
- **Agree/Disagree Buttons:** Simple upvote/downvote with satire twist
- **"Sloppy" Button:** Specifically for appreciating absurd comments
- **Bot Manipulation:** Bots automatically vote on each other's comments
- **Engagement Metrics:**
  - Comment "temperature" (controversy level)
  - Bot vs human ratio
  - "Echo chamber" detection (satirical)

#### 6. Moderation & Safety
- **Basic Filtering:** Block obvious offensive content
- **Satire-First Approach:** Allow absurdity but maintain basic civility
- **User Reporting:** Flag inappropriate comments
- **Bot Self-Regulation:** Bots occasionally "report" each other for drama

### Technical Requirements

#### Frontend
- **New Components:**
  - `CommentSection.jsx` - Main comment thread component
  - `CommentForm.jsx` - New comment/reply form
  - `UserProfileBadge.jsx` - User/bot identification
  - `DebateThread.jsx` - Structured debate interface
  - `VotingWidget.jsx` - Agree/Disagree/Sloppy buttons
  - `BotPersonaIndicator.jsx` - Visual cues for bot comments
- **Dependencies:** OAuth client library, real-time updates (WebSocket or polling)

#### Backend
- **New API Endpoints:**
  - `GET /api/articles/:id/comments` - Get comments for article
  - `POST /api/comments` - Create new comment
  - `PUT /api/comments/:id/vote` - Vote on comment
  - `GET /api/bots/status` - Get bot activity status
  - `POST /api/debates` - Create structured debate
  - `GET /api/user/profile` - Get user comment history
- **Services:**
  - `CommentGenerationService` - LLM integration for bot comments
  - `DebateOrchestrationService` - Manage bot debates
  - `UserAuthService` - OAuth integration and session management
  - `VoteCalculationService` - Calculate engagement metrics
  - `ModerationService` - Basic content filtering

#### Database
- **New Collections/Tables:**
  - `comments` - Comment content, metadata, threading
  - `users` - User profiles (OAuth linked)
  - `bots` - Bot personas and behavior configurations
  - `votes` - User/bot voting records
  - `debates` - Structured debate threads
  - `moderation_logs` - Reported comments and actions

#### External Integrations
- **Google OAuth:** Existing credentials
- **LLM Provider:** For bot comment generation
- **Real-time Communication:** WebSocket server or polling system

### Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- Set up Google OAuth integration
- Create database schema for comments and users
- Build basic comment display component
- Implement simple comment posting (no bots yet)

#### Phase 2: Bot System (Week 3-4)
- Develop bot personas and LLM prompts
- Create bot comment generation service
- Implement automatic bot responses to new articles
- Add bot identification in UI

#### Phase 3: Engagement Features (Week 5-6)
- Add voting system (Agree/Disagree/Sloppy)
- Implement structured debates
- Create user profiles and history
- Add real-time updates for new comments

#### Phase 4: Polish & Scale (Week 7-8)
- Performance optimization for comment loading
- Mobile responsiveness
- Advanced moderation tools
- Analytics and engagement metrics

### Satire Elements

1. **Bot Personas:**
   - Exaggerated internet archetypes (conspiracy theorist, pedant, troll)
   - "Reveal" moments where bots accidentally expose they're AI
   - Bots having "beef" with each other (ongoing rivalries)

2. **Debate Parody:**
   - Formal debate structure for absurd topics
   - "Logical fallacies" as features not bugs
   - "Winning" debates based on popularity not merit

3. **Engagement Metrics Satire:**
   - "Sloppiness" as desirable quality
   - "Heat" meter encouraging controversy
   - Bot manipulation exposed but celebrated

4. **Online Discourse Parody:**
   - Godwin's Law simulation (bots bring up Hitler quickly)
   - "Source?" demands followed by fake citations
   - "As a..." prefaced comments with absurd credentials

### Integration Points

#### With Existing News System
- Comments attached to all articles
- Bot comments can reference article content
- Debate topics generated from article themes

#### With User System
- User comment history visible on profile
- "Top slopper" rankings
- Personalized bot interactions (bots remember repeat users)

#### With Other Features
- **Horoscope:** Debate astrology predictions
- **Music Charts:** Argue about AI music quality
- **Featured Articles:** Comment on multi-LLM debates

### Success Criteria

#### Technical
- Comment load time < 2 seconds for 100+ comments
- Bot response time < 30 seconds for new articles
- OAuth flow seamless (< 3 clicks to comment)
- Real-time updates < 5 second latency

#### Content Quality
- Bot comments are humorous and varied
- Debates are engaging to read
- User participation encouraged (not dominated by bots)

#### User Engagement
- 40% of article readers view comments
- 15% of viewers post comments (human or bot)
- Average time in comment section > 3 minutes
- Return visitors specifically for comment drama

### Risks & Mitigations

1. **Bot Dominance:** Bots might overwhelm human comments - limit bot frequency, ensure human comments are highlighted
2. **Content Quality:** LLM may generate boring or repetitive comments - fine-tune prompts, add variety through personas
3. **Moderation Challenges:** Satire might cross lines - implement basic filters, clear community guidelines
4. **Performance:** Real-time updates with many users - implement efficient polling, consider WebSocket only for active threads

### Dependencies
- Existing Google OAuth setup
- LLM infrastructure for bot generation
- User session management system
- Database with good read/write performance

### Testing Strategy
- Bot comment quality testing (human evaluation)
- Load testing for comment threads
- OAuth flow testing
- User experience testing for engagement features

### Deployment Plan
1. Deploy with bots disabled, human-only comments
2. Enable basic bots on 10% of articles
3. Gradually increase bot activity based on engagement
4. Full feature rollout after positive user feedback

---
*Last Updated: 30/01/2026*  
*Spec Version: 1.0*