import { normalizeVietnamese } from "@/data/products";
import type { Product } from "@/data/types";

/**
 * Tìm sản phẩm có tên giống / gần giống từ khóa nhất (không phân biệt dấu, hoa thường, chịu được gõ sai nhẹ).
 *
 * Thứ tự ưu tiên:
 *   1. Tên chứa nguyên cụm từ khóa ("noi gang" → "Nồi gang tráng men")
 *   2. Từng từ khóa khớp với một từ trong tên: trùng, là đầu của từ, hoặc sai 1–2 ký tự ("quat dien" → "Quạt điện")
 *   3. Giống theo cụm 3 ký tự (trigram) — bắt các trường hợp gõ dính / thiếu dấu cách
 * Hòa điểm thì sản phẩm bán chạy hơn đứng trước.
 */

const normalize = (s: string) =>
  normalizeVietnamese(s)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Khoảng cách Levenshtein, dừng sớm khi vượt `max`. */
function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Mức khớp của một từ khóa với một từ trong tên: 0 → 1. */
function tokenMatch(q: string, word: string) {
  if (word === q) return 1;
  if (q.length >= 2 && word.startsWith(q)) return 0.9;
  if (word.length >= 3 && q.startsWith(word)) return 0.7;
  // Từ ngắn (≤ 4 ký tự) không cho sai — "quat" không được khớp "quan"
  const max = q.length <= 4 ? 0 : q.length <= 7 ? 1 : 2;
  if (max === 0) return 0;
  const d = editDistance(q, word, max);
  return d <= max ? 0.75 - 0.1 * d : 0;
}

function trigrams(s: string) {
  const padded = `  ${s} `;
  const set = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

function trigramSimilarity(a: string, b: string) {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let common = 0;
  ta.forEach((t) => tb.has(t) && common++);
  return (2 * common) / (ta.size + tb.size);
}

export function scoreName(query: string, name: string) {
  const q = normalize(query);
  const n = normalize(name);
  if (!q || !n) return 0;

  if (n === q) return 1000;
  if (n.startsWith(q)) return 900;
  const at = n.indexOf(q);
  if (at >= 0) return 800 - Math.min(at, 100);

  const qWords = [...new Set(q.split(" "))];
  const nWords = n.split(" ");
  const tokenScore = qWords.reduce((sum, w) => sum + Math.max(0, ...nWords.map((nw) => tokenMatch(w, nw))), 0) / qWords.length;
  if (tokenScore >= 0.5) return 300 + tokenScore * 400;

  const sim = trigramSimilarity(q.replace(/ /g, ""), n.replace(/ /g, ""));
  return sim >= 0.35 ? sim * 300 : 0;
}

export function suggestProducts(products: Product[], query: string, limit = 5) {
  return products
    .map((p) => ({ p, score: scoreName(query, p.name) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold)
    .slice(0, limit)
    .map((r) => r.p);
}
