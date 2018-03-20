// plugins/nuxt-client-init.js
export default async (ctx) => {
  await ctx.store.dispatch('nuxtClientInit', ctx)
}