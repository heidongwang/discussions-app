import { computed, observable, set } from 'mobx'
import { Post } from '@novuspherejs'
import ecc from 'eosjs-ecc'
import { getIdenticon } from '@utils'

class PostModel {
    @observable public map: { [p: string]: PostModel } | undefined
    @observable parentUuid
    @observable threadUuid
    @observable sub
    @observable uuid
    @observable title
    @observable poster
    @observable displayName
    @observable createdAt
    @observable editedAt
    @observable myVote
    @observable upvotes
    @observable downvotes
    @observable attachment
    @observable replies
    @observable content
    @observable edit
    @observable tags
    @observable mentions

    @observable transaction

    @observable verifySig
    @observable sig
    @observable pub

    @observable imageData
    @observable posterName

    constructor(post: Post) {
        set(this, post)

        let imageData = getIdenticon()

        if (this.pub) {
            imageData = getIdenticon(this.pub)
        }

        this.imageData = imageData

        if (this.displayName) {
            this.posterName = this.displayName
        } else {
            this.posterName = this.poster
        }
    }

    sign = (privKey: string) => {
        this.pub = ecc.privateToPublic(privKey)
        const hash0 = ecc.sha256(this.content)
        const hash1 = ecc.sha256(this.uuid + hash0)
        this.sig = ecc.sign(hash1, privKey)
        this.verifySig = this.pub
        return this
    }
}


export default PostModel
