export default ({ app }) => {
  app.router.beforeEach((to, from, next) => {
    if (to.path !== '/' && !app.store.state.loginState.loginUser) {
      next({
        path: '/',
        query: {
          redirect: to.fullPath,
        },
      })
    } else {
      next()
    }
  })
}