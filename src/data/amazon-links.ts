import type { AmazonAssociateEntry } from "../lib/amazon/associate-link.ts";

// 登録するのは、Amazonの商品ページで JAN・商品名・容量・型番（ページにある場合）が
// ペトカクの商品と同じことを確認したURLだけ。確認日を confirmedOn に書く。
// URLはアソシエイトのツールバーが発行した文字列をそのまま置く。追跡パラメータは足さない。
export const amazonAssociateLinks: AmazonAssociateEntry[] = [];
