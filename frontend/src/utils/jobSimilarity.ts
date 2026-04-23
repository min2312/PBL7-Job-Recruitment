import { Job } from '@/data/mockData';

/**
 * Tính similarity score giữa 2 công việc
 * - Cùng category: +2 điểm
 * - Cùng location: +1 điểm
 * - Cùng level: +1 điểm
 * TODO: Thêm word2vec similarity calculation ở đây sau
 */
export function calculateJobSimilarity(jobA: Job, jobB: Job): number {
  let score = 0;

  // Compare categories
  if (jobA.categoryIds.some(cid => jobB.categoryIds.includes(cid))) score += 2;

  // Compare locations
  if (jobA.locationIds.some(lid => jobB.locationIds.includes(lid))) score += 1;

  // Compare levels
  if (jobA.level === jobB.level) score += 1;

  return score;
}

/**
 * Lấy công việc tương tự dựa trên 1 công việc (cho JobDetail)
 * @param currentJob - Công việc hiện tại đang xem
 * @param allJobs - Danh sách tất cả công việc
 * @param limit - Số công việc tương tự cần lấy (mặc định: 4)
 */
export function getRelatedJobsForSingleJob(
  currentJob: Job,
  allJobs: Job[],
  limit: number = 4
): Job[] {
  return allJobs
    .filter(j => j.id !== currentJob.id)
    .map(j => ({
      job: j,
      score: calculateJobSimilarity(j, currentJob)
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.job);
}

/**
 * Lấy công việc tương tự dựa trên danh sách công việc đã lưu (cho SavedJobsPage - Cách 2)
 * Tìm những công việc tương tự với BẤT KỲ công việc nào trong danh sách đã lưu
 * @param currentJobs - Danh sách công việc đã lưu
 * @param allJobs - Danh sách tất cả công việc
 * @param limit - Số công việc tương tự cần lấy (mặc định: 4)
 */
export function getRelatedJobsForMultipleJobs(
  currentJobs: Job[],
  allJobs: Job[],
  limit: number = 4
): Job[] {
  const currentJobIds = new Set(currentJobs.map(j => j.id));

  return allJobs
    .filter(j => !currentJobIds.has(j.id))
    .map(j => {
      // Lấy similarity score cao nhất so với bất kỳ job đã lưu nào
      const scores = currentJobs.map(sj => calculateJobSimilarity(j, sj));
      return {
        job: j,
        score: Math.max(...scores)
      };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.job);
}
