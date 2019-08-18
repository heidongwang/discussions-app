import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { IPost } from '@stores/posts'
import { Feed } from '@components'
import { Router } from '@router'
import { TagModel } from '@models/tagModel'
import FeedModel from '@models/feedModel'

interface ITagProps {
    tagStore: IStores['tagStore']
    postsStore: IStores['postsStore']
    tagName: undefined | string
    tagModel: TagModel
    feed: FeedModel[]
}

// TODO: Merge logic between e/page and tag/page. Right now it's separated.

@inject('tagStore', 'postsStore')
@observer
class Tag extends React.Component<ITagProps> {
    static async getInitialProps({ query, store }) {
        const tag = query.name
        const postsStore: IStores['postsStore'] = store.postsStore
        const feed = await postsStore.getPostsByTag([tag])
        return {
            tagName: tag,
            feed: feed,
        }
    }

    componentWillMount(): void {
        this.props.tagStore.setActiveTag(this.props.tagName)
    }

    public clickPost = (post: IPost) => {
        const id = this.props.postsStore.encodeId(post) // Post.encodeId(post.transaction, new Date(post.createdAt));
        Router.pushRoute(
            `/e/${post.sub}/${id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`
        )
    }

    public render() {
        const {
            clickPost,
            props: { postsStore, tagStore, feed, tagName },
        } = this

        if (!feed || !feed.length) {
            return <span>No posts found for specified tag: {tagName}</span>
        }

        return (
            <Feed
                threads={postsStore.feedThreads}
                onClick={clickPost}
                tagModel={tagStore.activeTag}
            />
        )
    }
}

export default Tag
