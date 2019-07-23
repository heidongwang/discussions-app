import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IStores } from '@stores'
import { PostPreview } from '@components'
import { IPost } from '@stores/posts'

interface IPostPreviewProps {
    postsStore: IStores['postsStore']
    authStore: IStores['authStore']
    tagStore: IStores['tagStore']
}

@inject('postsStore', 'authStore', 'tagStore')
@observer
class NewPostPreview extends React.Component<IPostPreviewProps> {
    public render(): React.ReactNode {
        const { preview } = this.props.postsStore
        const { accountName } = this.props.authStore

        if (!preview) {
            return null
        }

        const post: IPost = {
            id: 0,
            transaction: '',
            blockApprox: 0,
            chain: '',
            parentUuid: '',
            threadUuid: '',
            uuid: '',
            title: preview.title,
            poster: accountName,
            content: preview.content,
            createdAt: Date.now() as any,
            sub: preview.sub.value,
            tags: [],
            mentions: [],
            edit: false,
            anonymousId: '',
            anonymousSignature: '',
            verifyAnonymousSignature: '',
            attachment: null,
            replies: [],
            totalReplies: 0,
            score: 0,
            upvotes: 0,
            downvotes: 0,
            alreadyVoted: false,
        }

        return (
            <>
                <span className={'lh-copy f6'}>
                    This is what your post will look like before you post.
                </span>
                <div className={'mt3'}>
                    <PostPreview
                        post={post as any}
                        onClick={() => false}
                        tag={this.props.tagStore.tags.get(post.sub)}
                        disableVoteHandler
                    />
                </div>
            </>
        )
    }
}

export default NewPostPreview as any
