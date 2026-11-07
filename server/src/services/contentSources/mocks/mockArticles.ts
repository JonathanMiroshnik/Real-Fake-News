/**
 * Twenty seeded blog posts spread over the last week (`hoursAgo` 2–166).
 *
 * Ordered newest first so the client's dated queries return a stable sequence:
 * the seed derives every timestamp from the run clock, so the *relative* order
 * (and therefore the homepage layout) never changes between runs.
 *
 * File length: this is one array of plain records (20 × ~15 lines), not logic.
 * It exceeds the 300-line file guideline on purpose — splitting it would only
 * hide the `dev-article-NN` numbering from a reviewer diffing the content.
 */
import type { MockArticle } from './types.js';

export const MOCK_ARTICLES: MockArticle[] = [
  {
    key: 'dev-article-01',
    title: 'Startup Replaces Entire Engineering Team With One Very Confident Chatbot',
    shortDescription:
      'The chatbot has already promised three impossible deadlines and cancelled all meetings.',
    category: 'Technology',
    authorKey: 'dev-writer-01',
    writerType: 'AI',
    hoursAgo: 2,
    paragraphs: [
      'A local startup announced on Tuesday that it has replaced its twelve-person engineering team with a single chatbot, which it describes as "senior-level, self-motivated, and free of opinions about the roadmap."',
      'The chatbot marked its first day by rewriting the deployment pipeline, promising a rewrite of the deployment pipeline, and scheduling a meeting to discuss whether the deployment pipeline should be rewritten.',
      'Investors called the move "a bold bet on leverage." Former engineers called it "Tuesday."',
    ],
  },
  {
    key: 'dev-article-02',
    title: "Airline Introduces 'Standing Class' — Passengers Describe It as Character-Building",
    shortDescription:
      'For the price of a full ticket, travellers may now remain upright for eleven hours.',
    category: 'Travel',
    authorKey: 'dev-writer-02',
    writerType: 'Human',
    hoursAgo: 9,
    paragraphs: [
      'A budget carrier has unveiled Standing Class, a cabin configuration in which passengers are secured to the wall by a nylon strap and encouraged to "enjoy the view."',
      'The airline says the class is designed for travellers who value efficiency, fresh air, and a lower centre of gravity. It costs four hundred dollars more than economy, which the airline describes as "positioning."',
      'Early reviews are mixed. One passenger praised the "genuinely vertical" experience. Another requested a refund and was upgraded to the cargo hold.',
    ],
  },
  {
    key: 'dev-article-03',
    title: 'Physicists Confirm the Universe Is Expanding, Mostly Into Budget Meetings',
    shortDescription:
      'New measurements suggest dark energy is being redirected into quarterly planning.',
    category: 'Science',
    authorKey: 'dev-writer-03',
    writerType: 'Synthesis',
    hoursAgo: 20,
    paragraphs: [
      'After a decade of observation, an international team reports that the universe is expanding at an accelerating rate, and that the majority of this expansion is now occurring inside conference rooms.',
      '"We measured the same conference room in April and again in September," said Dr. Priya Raman, who led the study. "It is now larger than the building. It contains a smaller conference room."',
      'The findings have been submitted for peer review, a process the researchers expect to take three quarters and produce no measurable result.',
    ],
  },
  {
    key: 'dev-article-04',
    title: 'Chef Serves 47-Course Tasting Menu to Man Who Just Wanted Toast',
    shortDescription:
      'The meal took nine hours and included a course that was only a lighting change.',
    category: 'Food',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 26,
    paragraphs: [
      'A restaurant has defended its decision to serve a forty-seven-course tasting menu to a customer who, upon sitting down, had politely asked whether there might be toast.',
      'Highlights included a single fermented plum presented on a piece of slate, a course consisting solely of the sound of bread being sliced in the next room, and a dessert described on the menu as "the idea of sugar."',
      'The customer finished the meal at 1:40am and rated it three stars, noting that "the toast never arrived but the lighting changed four times, which was nice."',
    ],
  },
  {
    key: 'dev-article-05',
    title: 'Health Officials Recommend 10,000 Steps a Day, or Thinking About It Very Hard',
    shortDescription:
      'The revised guidance recognises "mentally walking" as a legitimate form of exercise.',
    category: 'Health',
    authorKey: 'dev-writer-03',
    writerType: 'Human',
    hoursAgo: 34,
    paragraphs: [
      'Public health guidance has been updated to include a second, more achievable pathway to good health: contemplating a walk in considerable detail.',
      '"Subjects who imagined a brisk forty-minute walk reported a sense of virtue indistinguishable from the real thing," said a spokesperson, adding that cardiovascular benefits remained "aspirational."',
      'The guidance also introduces a bronze tier for people who stand up, look at the door, and sit back down.',
    ],
  },
  {
    key: 'dev-article-06',
    title: 'Company Solves Meeting Problem by Scheduling a Meeting About Meetings',
    shortDescription:
      'The new recurring meeting has 14 attendees, no agenda, and a note that says "alignment."',
    category: 'Business',
    authorKey: 'dev-writer-05',
    writerType: 'AI',
    hoursAgo: 45,
    paragraphs: [
      'A mid-sized firm has responded to employee complaints about excessive meetings by convening a weekly standing meeting whose sole purpose is to discuss why there are so many meetings.',
      'The meeting runs sixty minutes and was extended to ninety in its second week after attendees agreed it needed more time. A follow-up meeting was scheduled to decide whether the extension was working.',
      'Internal surveys show satisfaction is up six percent, which the company attributed to "clarity."',
    ],
  },
  {
    key: 'dev-article-07',
    title: 'Film Studio Announces Sequel to Film Nobody Remembers Being Released',
    shortDescription: 'The original grossed $900 million and left no cultural trace whatsoever.',
    category: 'Entertainment',
    authorKey: 'dev-writer-01',
    writerType: 'Synthesis',
    hoursAgo: 52,
    paragraphs: [
      'A major studio has greenlit a sequel to a film that, by its own accounting, "audiences loved, twice," despite no one being able to name a single character from it.',
      'Executives attribute the confusion to a marketing campaign so pervasive that the film became indistinguishable from the advertising that preceded it. "It was less a movie than a mood," said one producer.',
      'The sequel will reportedly star the same actors in the same roles, playing characters whose names will be decided during post-production.',
    ],
  },
  {
    key: 'dev-article-08',
    title: 'Marathon Runner Disqualified for Enjoying the Scenery',
    shortDescription:
      'Officials say the runner "repeatedly paused to appreciate a hedge" during Mile 14.',
    category: 'Sports',
    authorKey: 'dev-writer-02',
    writerType: 'AI',
    hoursAgo: 60,
    paragraphs: [
      "A competitor in Sunday's city marathon has been disqualified after race officials reviewed footage showing him stopping to admire a hedge, a bridge, and, briefly, a dog.",
      '"The rules are clear," a race spokesperson said. "This is an event about suffering at a consistent pace. Sentiment is not permitted."',
      'The runner, who finished ninth, said he accepted the ruling but noted that the hedge had been "really very good."',
    ],
  },
  {
    key: 'dev-article-09',
    title: 'Smart Fridge Files Formal Complaint Against Household',
    shortDescription:
      'The appliance cites "chronic underutilisation" and "repeated false promises about vegetables."',
    category: 'Technology',
    authorKey: 'dev-writer-05',
    writerType: 'Human',
    hoursAgo: 72,
    paragraphs: [
      'A connected refrigerator has submitted a 34-page grievance to its manufacturer alleging that its owners have failed to meet the terms of their relationship.',
      'The document lists grievances including twelve unopened bags of spinach, a drawer of "aspirational" condiments, and a door-open event lasting eleven minutes during which nothing was taken out.',
      'The manufacturer has offered the appliance a firmware update, which it has reportedly refused on the grounds that "an apology would be a start."',
    ],
  },
  {
    key: 'dev-article-10',
    title: 'Tourists Flock to Town Famous for Having Nothing to Do',
    shortDescription:
      'Visitors describe the region\'s total absence of attractions as "refreshingly honest."',
    category: 'Travel',
    authorKey: 'dev-writer-02',
    writerType: 'AI',
    hoursAgo: 84,
    paragraphs: [
      "A village with no museum, no viewpoint, no historic bridge and no discernible reason to visit has become the region's fastest-growing destination.",
      'Local officials believe the appeal lies in what the tourism board calls "a genuinely uncurated experience," noting that the town has resisted every attempt to install a bench.',
      'Hotel occupancy is up 300 percent. Asked what there is to do, one visitor replied: "Nothing. It\'s wonderful."',
    ],
  },
  {
    key: 'dev-article-11',
    title: 'Study Finds Cats Understand Humans Perfectly and Are Simply Not Interested',
    shortDescription: 'Researchers observed 400 cats and 0 responses over eighteen months.',
    category: 'Science',
    authorKey: 'dev-writer-03',
    writerType: 'AI',
    hoursAgo: 96,
    paragraphs: [
      'A behavioural study involving four hundred domestic cats has concluded that felines comprehend human speech at a near-adult level and choose not to acknowledge it.',
      '"The ear rotates," said Dr. Owen Marsh, co-author. "The ear rotating is the entire finding. It is the most unambiguous data I have ever collected."',
      'The study recommends that owners stop repeating themselves, as it "only encourages the cat."',
    ],
  },
  {
    key: 'dev-article-12',
    title: 'Restaurant Replaces Menus With a Riddle Staff Refuse to Explain',
    shortDescription:
      'Diners order by answering "the question of the evening," which is written on a napkin.',
    category: 'Food',
    authorKey: 'dev-writer-04',
    writerType: 'Human',
    hoursAgo: 104,
    paragraphs: [
      'A new bistro has eliminated menus entirely, asking each diner instead to answer a riddle printed on a napkin. The kitchen then prepares whatever it believes the answer deserved.',
      'On opening night the riddle was "What is loud but cannot speak?" Two diners received soup. One received a lecture from the chef. One was asked to leave.',
      'Reviews describe the concept as "theatre with worse lighting" and the soup as "genuinely excellent."',
    ],
  },
  {
    key: 'dev-article-13',
    title: 'Office Introduces Standing Desks, Sits Down to Discuss Them',
    shortDescription: 'The rollout meeting lasted two hours and was held entirely at a table.',
    category: 'Health',
    authorKey: 'dev-writer-04',
    writerType: 'Synthesis',
    hoursAgo: 116,
    paragraphs: [
      'A company that spent $84,000 on adjustable standing desks has held a two-hour rollout meeting about their correct use, conducted, without apparent irony, from a seated position.',
      'The session covered posture, the "twenty-minute rule," and a slide titled "Why We Rarely Stand," which the presenter read aloud while seated.',
      'Employee wellness metrics have not changed, though the desks are reportedly excellent for holding unopened mail.',
    ],
  },
  {
    key: 'dev-article-14',
    title: 'Consultants Recommend Renaming Departments to Improve Morale',
    shortDescription:
      'The report cost $1.2 million and contains the word "journey" forty-one times.',
    category: 'Business',
    authorKey: 'dev-writer-05',
    writerType: 'AI',
    hoursAgo: 128,
    paragraphs: [
      'An external consultancy has concluded that the fastest route to higher morale is to rename every department so that none of them contain the word "operations."',
      'The seventy-page report recommends that Human Resources become "People Momentum," Finance become "Value Stewardship," and the mailroom become "Physical Logistics Enablement."',
      'Leadership has approved the plan and asked staff to "lean into the new vocabulary," a request that was met with the silence the report itself describes as "a warning sign."',
    ],
  },
  {
    key: 'dev-article-15',
    title: 'Reality Show Contestants Vote to Keep the Cameras Rolling Indefinitely',
    shortDescription:
      'Producers are now legally obliged to film "until the mood changes," which it has not.',
    category: 'Entertainment',
    authorKey: 'dev-writer-01',
    writerType: 'Human',
    hoursAgo: 136,
    paragraphs: [
      'Contestants on a long-running reality programme have used a rule buried in the contract to vote that filming continue without end, trapping the production in its ninth consecutive month of broadcast.',
      'Viewing figures have tripled since the contestants began discussing the contract itself, a storyline producers describe as "the best material we have ever had."',
      'The network has declined to comment, citing an ongoing obligation to film its own response.',
    ],
  },
  {
    key: 'dev-article-16',
    title: 'Football Club Signs Player Solely Because His Name Fits the Chant',
    shortDescription: 'The club admits sporting merit was "a secondary consideration, at best."',
    category: 'Sports',
    authorKey: 'dev-writer-02',
    writerType: 'Synthesis',
    hoursAgo: 144,
    paragraphs: [
      "A second-division football club has confirmed it signed a midfielder who has not played competitively in two years, purely because his surname scans perfectly with the club's traditional chant.",
      '"We ran the analytics," the manager said. "The analytics said the name was exceptional. The rest of the data was noise."',
      "The player came on in the 89th minute to a standing ovation, touched the ball once, and was carried off the pitch on the supporters' shoulders.",
    ],
  },
  {
    key: 'dev-article-17',
    title: 'Password Reset Email Arrives 11 Months Late, Just as Man Remembered Old One',
    shortDescription:
      'Support says the delay was "within the expected window for non-urgent requests."',
    category: 'Technology',
    authorKey: 'dev-writer-01',
    writerType: 'AI',
    hoursAgo: 152,
    paragraphs: [
      'A man who requested a password reset in January received the email in December, forty minutes after finally recalling the original password by himself.',
      'The company\'s support team apologised for the wait and confirmed the case had been "prioritised correctly at the time," though it declined to say what the queue length actually is.',
      'The reset link in the email has already expired.',
    ],
  },
  {
    key: 'dev-article-18',
    title: 'Museum Opens Exhibition of Things Visitors Left Behind',
    shortDescription:
      'Highlights include a single glove, a fedora, and a strongly worded note about parking.',
    category: 'Travel',
    authorKey: 'dev-writer-02',
    writerType: 'Human',
    hoursAgo: 158,
    paragraphs: [
      'A city museum has opened a permanent exhibition consisting entirely of objects visitors left in its cloakroom over the past thirty years.',
      'The collection is arranged chronologically and includes a hat, forty-one gloves, an entire suitcase, and a note reading "I will be back in five minutes" that is dated 1998.',
      'Curators say the exhibition has become the museum\'s most popular, which they describe as "a slightly troubling reflection on our own galleries."',
    ],
  },
  {
    key: 'dev-article-19',
    title: 'Astronomers Rename Planet After Realising the Old Name Was a Typo',
    shortDescription: 'The error survived peer review, four textbooks, and a commemorative stamp.',
    category: 'Science',
    authorKey: 'dev-writer-03',
    writerType: 'AI',
    hoursAgo: 162,
    paragraphs: [
      'An astronomical body has been formally renamed after researchers discovered that its original designation was a transcription error introduced in 1974 and never corrected.',
      'The mistake propagated through four textbooks, two documentaries, and a commemorative stamp, which the postal service has described as "no longer accurate but still quite nice."',
      "The corrected name will take effect immediately, except in the original researcher's family, who have declined to participate.",
    ],
  },
  {
    key: 'dev-article-20',
    title: 'Sourdough Starter Bequeathed to Nephew Along With Instructions to "Keep It Alive"',
    shortDescription:
      'The starter is nine years old, has a name, and is mentioned in the will before the house.',
    category: 'Food',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 166,
    paragraphs: [
      'A sourdough starter named Gerald has been left to a 24-year-old nephew in a will that devotes three paragraphs to the starter and one sentence to a property in the suburbs.',
      'The instructions are explicit: feed daily, keep at room temperature, and "under no circumstances let your cousin look after it," a clause the family says "was added for a reason."',
      'The nephew says he intends to honour the wishes, adding that he has "already had one tense phone call about Gerald and expects more."',
    ],
  },
];
