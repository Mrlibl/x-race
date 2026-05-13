export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

// 后端返回值解析
export function parseLangField(raw: any) {
  if (raw == null) return { en: "", zh: "" }

  let s = String(raw).trim()

  // ① 先尝试把包了一层的字符串解出来（去掉 \ 转义）
  try {
    // 例如 "\"[\\\"en\\\"=>\\\"entitle\\\",\\\"zh\\\"=>\\\"中文 tiele\\\"]\""
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      s = JSON.parse(s)         // 变成 ["en"=>"entitle","zh"=>"中文 tiele"]
    }
  } catch { }

  // ② 如果已经是标准 JSON（比如 {"en":"...","zh":"..."})，直接返回
  try {
    const obj = JSON.parse(s)
    return obj
  } catch { }

  // ③ 规范化 PHP 风格 => JSON
  s = s
    .replace(/=>/g, ":")     // "en"=>"xx"  ->  "en":"xx"
    .replace(/'/g, '"')      // 单引号转双引号（以防万一）
    .replace(/\\+/g, "")     // 清多余反斜杠

  // ④ 如果是 [ ... ] 这种带键的“数组”，换成 { ... } 才符合 JSON 对象
  if (s.startsWith("[") && s.endsWith("]")) {
    s = `{${s.slice(1, -1)}}`
  }

  // ⑤ 保证键有引号（如果后端没加引号也能兜底）
  s = s.replace(/([{\s,])([A-Za-z0-9_]+)\s*:/g, '$1"$2":')

  try {
    return JSON.parse(s)   // 得到 { en: "...", zh: "..." }
  } catch (e) {
    // console.error("语言字段解析失败:", raw, "=>", s, e)
    return { en: String(raw), zh: String(raw) }
  }
}