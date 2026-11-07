/**
 * Ten seeded recipes and the five food names the recipe job draws from.
 *
 * `foods` is a table the recipe job reads before writing anything, so seeding it
 * keeps the pipeline runnable in dev once Phase 3 turns the jobs on.
 */
import type { MockRecipe } from './types.js';

export const MOCK_FOODS: string[] = ['Toast', 'Soup', 'Pasta', 'Curry', 'Pie'];

export const MOCK_RECIPES: MockRecipe[] = [
  {
    key: 'dev-recipe-01',
    title: 'The Sincerest Toast',
    shortDescription: 'Bread, heat, and an honest relationship with butter.',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 8,
    paragraphs: [
      'Toast is not a dish so much as a position: that bread, given heat, becomes better than bread.',
      '## Ingredients\n- Two slices of bread\n- Butter, to taste, then a little more\n- Salt (optional, but noticed)',
      '## Method\nToast the bread until it is exactly as dark as you claim to like it. Butter immediately, while it is still hot enough to accept the butter as a fact.',
      '## Notes\nIf the toast is cold by the time you eat it, the fault is structural, not personal.',
    ],
  },
  {
    key: 'dev-recipe-02',
    title: 'Soup of Unclear Origin',
    shortDescription: 'Whatever was in the fridge, simmered until it agreed to be soup.',
    authorKey: 'dev-writer-04',
    writerType: 'Human',
    hoursAgo: 21,
    paragraphs: [
      'This soup begins with a question: what is in the fridge? The answer determines everything that follows.',
      '## Ingredients\n- One onion, roughly dealt with\n- Whatever vegetables are closest to the front\n- Stock, or the memory of stock\n- Salt, in stages',
      '## Method\nSoften the onion. Add the vegetables in order of increasing doubt. Cover with liquid and simmer for as long as the conversation lasts.',
      '## Notes\nBlending is optional. Blending is always optional.',
    ],
  },
  {
    key: 'dev-recipe-03',
    title: 'Pasta With No Plan',
    shortDescription: 'A recipe that ends when the pasta is done, which is earlier than you think.',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 37,
    paragraphs: [
      'The best pasta is made by someone who has stopped trying to improve it.',
      '## Ingredients\n- Pasta\n- Garlic, more than the recipe says\n- Olive oil\n- Something green, for the photograph',
      '## Method\nBoil the pasta in water that tastes of the sea, or at least of salt. Warm the garlic in oil until it smells like a decision. Combine.',
      '## Notes\nReserve a cup of pasta water. You will forget it exists and then remember it at the perfect moment.',
    ],
  },
  {
    key: 'dev-recipe-04',
    title: 'Curry That Gets Better Tomorrow',
    shortDescription: 'Today it is fine. Tomorrow it is the whole point.',
    authorKey: 'dev-writer-04',
    writerType: 'Synthesis',
    hoursAgo: 55,
    paragraphs: [
      'Every curry contains a small delay: flavours that are not yet speaking to each other, but will be by morning.',
      '## Ingredients\n- Spices, toasted until fragrant and slightly alarming\n- Onion, cooked far longer than feels reasonable\n- Tomatoes, tinned and trusting\n- Something to soak it up',
      '## Method\nToast the spices. Cook the onion down. Add everything else and leave it alone, which is the hardest instruction in cooking.',
      '## Notes\nCool, refrigerate, reheat gently. Serve to someone who doubted you.',
    ],
  },
  {
    key: 'dev-recipe-05',
    title: 'Pie With a Structurally Ambitious Lid',
    shortDescription: 'The lattice is decorative and load-bearing in equal measure.',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 72,
    paragraphs: [
      'A pie is a small architecture project with a filling.',
      '## Ingredients\n- Pastry, cold and patient\n- Filling of your choosing, thickened\n- One egg, for vanity',
      '## Method\nLine the tin. Fill it. Weave the lid. Do not panic when it sags; call it rustic and carry on.',
      '## Notes\nServe warm. The opinion of the eater is not required, but it is noted.',
    ],
  },
  {
    key: 'dev-recipe-06',
    title: 'Breakfast, Reconsidered',
    shortDescription: 'Three ingredients, one pan, and a firm position on eggs.',
    authorKey: 'dev-writer-05',
    writerType: 'Human',
    hoursAgo: 90,
    paragraphs: [
      'Breakfast is a negotiation between ambition and the amount of time you actually have.',
      '## Ingredients\n- Eggs\n- Bread\n- Oil or butter, whichever is nearer',
      '## Method\nHeat the pan properly — this is the entire technique. Add the eggs. Move them less than you want to.',
      '## Notes\nEat standing up, if that is the sort of morning it is.',
    ],
  },
  {
    key: 'dev-recipe-07',
    title: 'Salad for People Who Do Not Want Salad',
    shortDescription: 'Crunch, salt, fat, acid, and no moralising whatsoever.',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 108,
    paragraphs: [
      'A salad does not have to be a punishment. It simply has to be dressed properly.',
      '## Ingredients\n- Leaves, cold and dry\n- Something salty\n- Something sharp\n- Far more oil than feels sensible',
      '## Method\nDry the leaves completely — water is the enemy of dressing. Toss with the sharp and the salty. Add oil last and toss again.',
      '## Notes\nDo not add dressing until the last possible second, then add it more generously than that.',
    ],
  },
  {
    key: 'dev-recipe-08',
    title: 'The Sunday Roast, Explained to a Vegetarian',
    shortDescription: 'Mostly an argument about potatoes, and the potatoes win.',
    authorKey: 'dev-writer-05',
    writerType: 'Synthesis',
    hoursAgo: 124,
    paragraphs: [
      'The roast is a scheduling exercise disguised as a meal.',
      '## Ingredients\n- Potatoes, parboiled and shaken\n- Fat, hot\n- Root vegetables, cut to the same size out of stubbornness\n- Something to roast, if you insist',
      '## Method\nParboil the potatoes, rough them up, and roast them in hot fat until they are audible from the next room.',
      '## Notes\nThe potatoes are the point. Everything else is accompaniment with opinions.',
    ],
  },
  {
    key: 'dev-recipe-09',
    title: 'A Cake That Does Not Need Icing',
    shortDescription: 'Controversial, but the cake holds its position.',
    authorKey: 'dev-writer-04',
    writerType: 'AI',
    hoursAgo: 140,
    paragraphs: [
      'Icing exists to apologise for a dry cake. This cake has nothing to apologise for.',
      '## Ingredients\n- Butter and sugar, creamed until pale\n- Eggs, one at a time, patiently\n- Flour, folded rather than beaten\n- A pinch of salt, for honesty',
      '## Method\nCream, add, fold, bake. Do not open the oven to check; the cake can hear it.',
      '## Notes\nDust with sugar. Serve in slices that are slightly too large.',
    ],
  },
  {
    key: 'dev-recipe-10',
    title: 'Midnight Something on Toast',
    shortDescription: 'The last recipe in any good cookbook, and the most used.',
    authorKey: 'dev-writer-04',
    writerType: 'Human',
    hoursAgo: 158,
    paragraphs: [
      'There is a hour at which all cooking becomes improvisation.',
      '## Ingredients\n- Toast\n- Whatever is left\n- A willingness to accept the outcome',
      '## Method\nToast the bread. Warm whatever is left. Combine without ceremony.',
      '## Notes\nEaten in the kitchen, standing, with the light off. This is not a suggestion.',
    ],
  },
];
