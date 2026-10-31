const express = require('express');
const router = express.Router();
const ai = require('../utils/gemini.js');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

router.get('/', (req, res) => {
  res.render('travelPlan.ejs', {
    success: [],
    error: [],
    travelPlan: null,
    destination: '',
    days: '',
    budget: '',
    interests: '',
  });
});

router.post('/', async (req, res) => {
  const { destination, days, budget, interests } = req.body;

  const cleanDestination =
    typeof destination === 'string' ? destination.trim() : '';
  const numberOfDays = Number(days);
  const cleanBudget =
    typeof budget === 'string' ? budget.trim() : '';
  const cleanInterests =
    typeof interests === 'string' ? interests.trim() : '';

  const validBudgets = ['low', 'moderate', 'high'];

  if (
    !cleanDestination ||
    !Number.isInteger(numberOfDays) ||
    numberOfDays < 1 ||
    !validBudgets.includes(cleanBudget) ||
    !cleanInterests
  ) {
    return res.status(400).render('travelPlan.ejs', {
      success: [],
      error: [
        'Enter a destination, a positive whole number of days, a budget, and your interests.',
      ],
      travelPlan: null,
      destination: cleanDestination,
      days,
      budget: cleanBudget,
      interests: cleanInterests,
    });
  }

  let response;

  try {
    response = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: `Create a practical ${numberOfDays}-day travel plan for ${cleanDestination}.
Budget: ${cleanBudget}.
Interests: ${cleanInterests}.
Organize the plan by day and tailor suggestions to the budget and interests.`,
    });
  } catch (err) {
    console.error('Gemini request failed:', err.message);

    return res.status(502).render('travelPlan.ejs', {
      success: [],
      error: ['The travel plan could not be generated. Please try again.'],
      travelPlan: null,
      destination: cleanDestination,
      days: numberOfDays,
      budget: cleanBudget,
      interests: cleanInterests,
    });
  }

  const html = await marked.parse(response.output_text || '');
  const safeTravelPlan = sanitizeHtml(html);

  res.render('travelPlan.ejs', {
    success: [],
    error: [],
    travelPlan: safeTravelPlan,
    destination: cleanDestination,
    days: numberOfDays,
    budget: cleanBudget,
    interests: cleanInterests,
  });
});

module.exports = router;