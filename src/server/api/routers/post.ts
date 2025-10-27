import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Minimal tRPC router - not used in current landing page implementation
export const postRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),
});
