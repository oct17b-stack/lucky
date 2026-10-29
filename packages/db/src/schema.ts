/**
 * 业务数据表，对应规划文档第 8 节。
 * user_id 引用 Better Auth 的 "user" 表（文本主键）。
 * 出生信息以应用层加密后的密文存储，字段以 _enc 结尾。
 */
import { boolean, doublePrecision, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

const id = () => text('id').primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

/** 用户保存的命主：自己、家人、伴侣 */
export const birthProfiles = pgTable(
  'birth_profiles',
  {
    id: id(),
    userId: text('user_id').notNull(),
    nameEnc: text('name_enc').notNull(),
    /** 加密的 { year, month, day, hour, minute }；hour 为空表示不知道出生时间 */
    birthEnc: text('birth_enc').notNull(),
    timeZone: text('time_zone').notNull(),
    cityId: text('city_id'),
    longitude: doublePrecision('longitude').notNull(),
    gender: text('gender').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('birth_profiles_user_idx').on(t.userId)],
);

/** 计算结果缓存：记录引擎版本和流派选项，保证可复现 */
export const charts = pgTable(
  'charts',
  {
    id: id(),
    profileId: text('profile_id')
      .notNull()
      .references(() => birthProfiles.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // bazi / thai-birthday / taksa ...
    options: jsonb('options').notNull(),
    engineVersion: text('engine_version').notNull(),
    result: jsonb('result').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('charts_profile_type_idx').on(t.profileId, t.type)],
);

/** 权益：由 RevenueCat / Stripe Webhook 写入，后端是唯一真实来源 */
export const entitlements = pgTable(
  'entitlements',
  {
    id: id(),
    userId: text('user_id').notNull(),
    key: text('key').notNull(), // premium
    source: text('source').notNull(), // ios / android / stripe / promptpay
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('entitlements_user_key_source_uq').on(t.userId, t.key, t.source)],
);

/** 订单流水，用于对账和退款；金额用最小货币单位（萨当 / 分） */
export const purchases = pgTable(
  'purchases',
  {
    id: id(),
    userId: text('user_id').notNull(),
    product: text('product').notNull(),
    channel: text('channel').notNull(),
    externalId: text('external_id').notNull().unique(),
    amount: integer('amount').notNull(),
    currency: text('currency').notNull(),
    status: text('status').notNull(), // pending / paid / refunded / failed
    createdAt: createdAt(),
  },
  (t) => [index('purchases_user_idx').on(t.userId)],
);

/** 单次购买的报告额度 */
export const credits = pgTable(
  'credits',
  {
    id: id(),
    userId: text('user_id').notNull(),
    kind: text('kind').notNull(), // report / compatibility
    balance: integer('balance').notNull().default(0),
  },
  (t) => [uniqueIndex('credits_user_kind_uq').on(t.userId, t.kind)],
);

/** 付费报告：生成一次后缓存 */
export const reports = pgTable(
  'reports',
  {
    id: id(),
    chartId: text('chart_id')
      .notNull()
      .references(() => charts.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    content: text('content').notNull(),
    aiUsed: boolean('ai_used').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('reports_chart_locale_uq').on(t.chartId, t.locale)],
);

/** 全球城市库，来源 GeoNames */
export const cities = pgTable(
  'cities',
  {
    id: text('id').primaryKey(),
    nameTh: text('name_th').notNull(),
    nameZhs: text('name_zhs').notNull(),
    nameZht: text('name_zht').notNull(),
    nameEn: text('name_en').notNull(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    timeZone: text('time_zone').notNull(),
    country: text('country').notNull(),
  },
  (t) => [index('cities_country_idx').on(t.country)],
);

/** 运势与知识文章 */
export const contentPages = pgTable(
  'content_pages',
  {
    id: id(),
    slug: text('slug').notNull(),
    locale: text('locale').notNull(),
    type: text('type').notNull(), // horoscope / article / lucky-color
    title: text('title').notNull(),
    body: text('body').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('content_pages_slug_locale_uq').on(t.slug, t.locale)],
);
