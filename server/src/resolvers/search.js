const { algolia } = require('../integrations')

module.exports = {
  Query: {
    search: async (_, args, ctx, info) => {
      const { text, tags = [], flags = [], skip, first, ...params } = args

      let results = {
        meta: {
          pageCurrent: skip / first + 1
        },
        skip,
        first,
        ...params
      }

      if (!text && tags.length === 0 && flags.length === 0) {
        const count = (await ctx.prisma.query.zNodesConnection(params, '{ aggregate { count } }'))
          .aggregate.count

        results = {
          ...results,
          ids: null,
          count
        }
      } else {
        const { ids, highlights, nbHits } = await algolia.search(ctx, args)

        results = {
          ...results,
          ids,
          highlights,
          count: nbHits
        }
      }

      return {
        ...results,
        meta: {
          ...results.meta,
          entriesCount: results.count,
          pagesCount: Math.ceil(results.count / first)
        }
      }
    }
  },
  SearchResult: {
    nodes: async ({ ids, highlights, ...params }, args, ctx, info) => {
      if (!ids) {
        return ctx.prisma.query.zNodes({ orderBy: 'createdAt_DESC', ...params }, info)
      }

      let nodes = await ctx.prisma.query.zNodes(
        {
          where: {
            id_in: ids
          }
        },
        info
      )

      nodes = nodes
        .map(node => ({ ...node, highlights: highlights[node.id] }))
        .sort((a, b) => {
          return ids.indexOf(a.id) - ids.indexOf(b.id)
        })

      return nodes
    }
  }
}
