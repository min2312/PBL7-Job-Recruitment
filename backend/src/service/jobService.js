const db = require("../models");
const { Op } = db.Sequelize;
const crypto = require('crypto');

async function fetchRandomJobsByLocation({ location = 'all', page = 1, limit = 10, seed = null, salary = null, experience = null, employmentType = null, categoryId = null }) {
  const loc = (location || 'all').toString().toLowerCase();
  const pageNum = Math.max(1, parseInt(page || '1'));
  const pageSize = Math.max(1, parseInt(limit || '10'));
  const offset = (pageNum - 1) * pageSize;

  const HANOI_KEYS = ['hà nội','ha noi','hanoi'];
  const HCM_KEYS = ['hồ chí minh','ho chi minh','thành phố hồ chí minh','tp hcm','hcm','sài gòn','saigon'];
  const MIENBAC_KEYS = ['hà nội','hải phòng','quảng ninh','thái bình','nam định','ninh bình','hải dương','hưng yên','phú thọ','bắc ninh','bắc giang','vĩnh phúc','thái nguyên','lạng sơn','cao bằng','bắc kạn','hà giang'];
  const MIENNAM_KEYS = ['hồ chí minh','can tho','an giang','bac lieu','ben tre','cà mau','dong thap','long an','tien giang','bình dương','đồng nai','bà rịa','kiên giang','tây ninh','vĩnh long','hau giang','sóc trăng','bình thuận','ninh thuận','khánh hòa'];

  // Build a case-insensitive location filter compatible with MySQL/MariaDB
  // Use LOWER(column) LIKE lowerValue to avoid relying on Postgres-only ILIKE
  let locationFilter = null;
  if (loc !== 'all') {
    let keys = [];
    if (loc.includes('hanoi') || loc.includes('ha') || loc.includes('hà nội')) keys = HANOI_KEYS;
    else if (loc.includes('hcm') || loc.includes('chi minh') || loc.includes('sài gòn') || loc.includes('saigon')) keys = HCM_KEYS;
    else if (loc.includes('mien') && loc.includes('bac')) keys = MIENBAC_KEYS;
    else if (loc.includes('mien') && loc.includes('nam')) keys = MIENNAM_KEYS;
    else keys = [loc];

    const orConditions = keys.map(k => db.sequelize.where(
      db.sequelize.fn('LOWER', db.sequelize.col('locations.name')),
      Op.like,
      `%${k.toString().toLowerCase()}%`
    ));

    locationFilter = { [Op.or]: orConditions };
  }

  const include = [
    {
      model: db.Location,
      as: 'locations',
      through: { attributes: [] },
      required: !!locationFilter,
      where: locationFilter || undefined,
    },
    {
      model: db.Company,
      as: 'Company',
      required: false,
    },
  ];

  // Helpers to convert label inputs into ranges before building DB where
  const salaryLabelToRange = (label) => {
    if (!label) return null;
    const l = label.toString().trim().toLowerCase();
    if (l === 'tất cả' || l === 'tat ca' || l === 'all') return null;
    // If user selected 'thỏa thuận' or similar, return a text filter marker so we apply a DB substring WHERE
    if (l.includes('thỏa') || l.includes('thoa') || l.includes('thương lượng') || l.includes('thuong luong')) return { text: 'thỏa' };
    // If label contains numeric information, try to parse it
    const parsed = parseSalaryRange(label);
    if (parsed) return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];

    // Common UI buckets (fallback)
    const map = {
      'dưới 10 triệu': [0, 10],
      '10 - 15 triệu': [10, 15],
      '15 - 20 triệu': [15, 20],
      '20 - 25 triệu': [20, 25],
      '25 - 30 triệu': [25, 30],
      '30 - 50 triệu': [30, 50],
      'trên 50 triệu': [50, Infinity],
    };
    return map[l] || null;
  };

  const experienceLabelToRange = (label) => {
    if (!label) return null;
    const l = label.toString().trim().toLowerCase();
    if (l === 'tất cả' || l === 'tat ca' || l === 'all' || l.includes('không yêu cầu')) return null;
    if (l.includes('chưa')) return [0, 0];
    const parsed = parseExperienceRange(label);
    if (parsed) return [parsed.min, parsed.max === Infinity ? Infinity : parsed.max];

    const map = {
      '1 năm': [1, 1],
      '2 năm': [2, 2],
      '3 năm': [3, 3],
      '4 - 5 năm': [4, 5],
      'trên 5 năm': [5, Infinity],
    };
    return map[l] || null;
  };

  // Build where clause for Job-level filters (only when we won't do numeric in-memory filtering)
  const jobWhere = {};

  // If categoryId provided, include a join condition through categories
  if (categoryId) {
    include.push({
      model: db.Category,
      as: 'categories',
      through: { attributes: [] },
      required: true,
      where: { id: categoryId },
    });
  }

  const parseSalaryRange = (salaryStr) => {
    if (!salaryStr) return null;
    try {
      const sRaw = salaryStr.toString().toLowerCase();

      // Normalize thousands separators but preserve decimal points when appropriate
      let s = sRaw.replace(/\u00A0/g, ' ');
      // detect unit hints
      const unit = s.includes('triệu') ? 'million' : (s.includes('usd') ? 'usd' : 'vnd');

      // remove common words
      s = s.replace(/mức lương:|mức thu nhập|thu nhập|vnd|đ|vnđ|usd/gi, ' ');

      // Remove thousand separators like 12,000,000 or 12.000.000 -> keep decimal dots
      s = s.replace(/(\d)[,](?=\d{3})/g, '$1');
      s = s.replace(/(\d)\.(?=\d{3})/g, '$1');

      const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map(m => parseFloat(m[1].replace(',', '.')));

      const toMillion = (n) => {
        if (unit === 'million') return n;
        if (unit === 'usd') return n * 25; // approximate: 1 USDk ~= 25 million VND scaling (approx)
        if (n > 1000) return n / 1000000; // raw VND -> million
        return n; // assume already in millions
      };

      if (nums.length >= 2) {
        const a = toMillion(nums[0]);
        const b = toMillion(nums[1]);
        return { min: Math.min(a, b), max: Math.max(a, b) };
      }

      if (nums.length === 1) {
        const n = toMillion(nums[0]);
        if (s.includes('dưới') || s.includes('under') || s.includes('tới')) return { min: 0, max: n };
        if (s.includes('trên') || s.includes('>') || s.includes('from') || s.includes('từ')) return { min: n, max: Infinity };
        return { min: n, max: n };
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  const parseExperienceRange = (expStr) => {
    if (!expStr) return null;
    try {
      const s = expStr.toString().toLowerCase();
      if (s.includes('không yêu cầu') || s.includes('khong yeu cau') || s.includes('no experience') || s.includes('not required')) return null;
      if (s.includes('chưa') || s.includes('chưa có kinh nghiệm')) return { min: 0, max: 0 };
      const nums = Array.from(s.matchAll(/(\d+(?:[\.,]\d+)?)/g)).map(m => parseFloat(m[1].replace(',', '.')));
      if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
      if (nums.length === 1) {
        const n = nums[0];
        if (s.includes('trên') || s.includes('>') || s.includes('from')) return { min: n, max: Infinity };
        if (s.includes('dưới') || s.includes('tối đa') || s.includes('under')) return { min: 0, max: n };
        return { min: n, max: n };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // If salary/experience filters require numeric comparison, perform in-memory filtering
  let salaryRangeRaw = salary ? salaryLabelToRange(salary) : null;
  let salaryTextFilter = null;
  if (salaryRangeRaw && typeof salaryRangeRaw === 'object' && salaryRangeRaw.text) {
    salaryTextFilter = salaryRangeRaw.text;
    salaryRangeRaw = null;
  }
  const salaryRange = Array.isArray(salaryRangeRaw) ? salaryRangeRaw : null;
  const experienceRange = experience ? experienceLabelToRange(experience) : null;

  if (salaryRange) console.debug('[jobService] parsed salary filter range', { salary, salaryRange });
  if (experienceRange) console.debug('[jobService] parsed experience filter range', { experience, experienceRange });

  // If we've mapped UI labels to numeric ranges, avoid adding substring WHEREs on the DB
  if (salaryRange) delete jobWhere.salary;
  if (experienceRange) delete jobWhere.experience;

  // If the user requested a textual salary filter like 'thỏa', apply a DB WHERE on salary containing that text
  if (salaryTextFilter) {
    jobWhere[Op.and] = jobWhere[Op.and] || [];
    jobWhere[Op.and].push(db.sequelize.where(
      db.sequelize.fn('LOWER', db.sequelize.col('Job.salary')),
      Op.like,
      `%${salaryTextFilter}%`
    ));
  }

  if (salaryRange || experienceRange) {
    // Fetch all matching rows for other filters (no salary/experience in DB where)
    const allRows = await db.Job.findAll({
      where: jobWhere,
      include,
      distinct: true,
    });

    // Sort deterministically if seed provided, otherwise shuffle
    let ordered = allRows.slice();
    if (seed) {
      ordered.sort((a, b) => {
        const ha = crypto.createHash('md5').update(String(a.id) + seed).digest('hex');
        const hb = crypto.createHash('md5').update(String(b.id) + seed).digest('hex');
        return ha.localeCompare(hb);
      });
    } else {
      // simple shuffle
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }

    // Filter by salary/experience ranges in JS (range overlap)
    const filtered = ordered.filter((job) => {
      try {
        if (salaryRange) {
          const jobRange = parseSalaryRange(job.salary);
          if (!jobRange) return false;
          const fMin = salaryRange[0];
          const fMax = salaryRange[1] === Infinity ? Infinity : salaryRange[1];
          const jMin = jobRange.min;
          const jMax = jobRange.max === Infinity ? Infinity : jobRange.max;
          // overlap test
          if (jMax < fMin || jMin > fMax) return false;
        }
        if (experienceRange) {
          const jobRange = parseExperienceRange(job.experience);
          if (!jobRange) return false;
          const fMinE = experienceRange[0];
          const fMaxE = experienceRange[1] === Infinity ? Infinity : experienceRange[1];
          const jMinE = jobRange.min;
          const jMaxE = jobRange.max === Infinity ? Infinity : jobRange.max;
          if (jMaxE < fMinE || jMinE > fMaxE) return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    });

    const totalFiltered = filtered.length;
    const start = offset;
    const pageRows = filtered.slice(start, start + pageSize);

    // Build a faux result object
    const result = {
      count: totalFiltered,
      rows: pageRows,
    };

    // Debug logging
    try {
      console.debug('[jobService] fetchRandomJobsByLocation (in-memory filter)', { location: loc, salaryRange, experienceRange, totalFiltered, returned: pageRows.length });
    } catch (e) {}

    const returnedSeed = seed || (pageNum === 1 ? Math.random().toString(36).slice(2, 10) : null);
    return {
      total: result.count,
      page: pageNum,
      pageSize,
      jobs: result.rows,
      seed: returnedSeed,
    };
  }

  // Determine ordering: deterministic by seed if provided, else random
  let orderOption;
  if (seed) {
    // Use MD5(CONCAT(CAST(Job.id AS CHAR), seed)) for MySQL deterministic ordering
    orderOption = [[
      db.sequelize.literal(`MD5(CONCAT(CAST(\`Job\`.\`id\` AS CHAR), '${seed}'))`),
      'ASC'
    ]];
  } else {
    orderOption = db.sequelize.random();
  }

  const result = await db.Job.findAndCountAll({
    where: jobWhere,
    include,
    distinct: true,
    limit: pageSize,
    offset,
    order: orderOption,
  });

  // If no seed provided and pageNum === 1, generate a seed to return to client
  const returnedSeed = seed || (pageNum === 1 ? Math.random().toString(36).slice(2, 10) : null);

  return {
    total: result.count,
    page: pageNum,
    pageSize,
    jobs: result.rows,
    seed: returnedSeed,
  };
}

module.exports = {
  fetchRandomJobsByLocation,
};
