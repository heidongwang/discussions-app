// tslint:disable-next-line:no-var-requires
const routes = require('next-routes')

/**
 * Pattern:
 * routes.add([name], pattern = /name, page = name)
 */
export const Routes = routes()
    .add('e', '/e/:tag/:id?/:title?')
    .add('tag', '/tag/:name')
    .add('settings', '/settings')

export const Link = Routes.Link

export const Router = Routes.Router
