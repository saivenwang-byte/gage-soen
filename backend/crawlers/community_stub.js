/** UGC 用户提交由 API 注入，此处不爬取 */
export const name = 'ugc';
export const label = '家人提交';
export const types = ['community'];
export const scenes = ['*'];
export async function crawl() {
  return [];
}
