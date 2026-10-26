import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const line = z.object({
  kind: z.enum(['code', 'comment', 'add', 'del', 'ok', 'warn', 'dim']).default('code'),
  text: z.string(),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    card: z.string(),
    summary: z.string(),
    client: z.string(),
    role: z.string(),
    period: z.string(),
    order: z.number(),
    status: z.enum(['shipped', 'in-progress']).default('shipped'),
    stack: z.array(z.string()),
    stats: z
      .array(z.object({ value: z.coerce.string(), label: z.string() }))
      .max(3)
      .default([]),
    quote: z.object({ text: z.string(), name: z.string(), role: z.string() }).optional(),
    panel: z.object({
      file: z.string(),
      lines: z.array(line),
    }),
  }),
});

export const collections = { work };
