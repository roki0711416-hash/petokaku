// 価格履歴DBはサーバーだけが使う。ブラウザ用コンポーネントから import するとビルドで失敗する。
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const urlEnv = "SUPABASE_URL";
const secretKeyEnv = "SUPABASE_SECRET_KEY";

let client: SupabaseClient | null = null;

function readServerEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (value === "") {
    throw new Error(`${name} が未設定です。サーバー用の環境変数にだけ設定してください。`);
  }
  return value;
}

export function isSupabaseConfigured(): boolean {
  return (process.env[urlEnv]?.trim() ?? "") !== "" && (process.env[secretKeyEnv]?.trim() ?? "") !== "";
}

export function getSupabaseServerClient(): SupabaseClient {
  if (client) {
    return client;
  }

  client = createClient(readServerEnv(urlEnv), readServerEnv(secretKeyEnv), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
