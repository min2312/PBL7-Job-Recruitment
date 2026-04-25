const jobService = require("../service/jobService");

/**
 * GET /api/jobs/random
 * Query params:
 * - location: 'hanoi' | 'hcm' | 'mienbac' | 'miennam' | 'all' (default 'all')
 * - page: page number (1-based)
 * - limit: items per page (default 10)
 */
const getRandomJobsByLocation = async (req, res) => {
  try {
    const { location, page, limit, seed, salary, experience, employmentType, categoryId } = req.query || {};
    const data = await jobService.fetchRandomJobsByLocation({ location, page, limit, seed, salary, experience, employmentType, categoryId });
    return res.status(200).json({ errCode: 0, errMessage: 'OK', jobs: data });
  } catch (error) {
    console.error('Error in getRandomJobsByLocation', error);
    return res.status(500).json({ errCode: -1, errMessage: 'Internal server error' });
  }
};

module.exports = {
  getRandomJobsByLocation,
};
