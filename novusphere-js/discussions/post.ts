//@ts-ignore
import ecc from 'eosjs-ecc'
import { Attachment } from './attachment'
import { getIdenticon } from '@utils'
const BigInt = require('big-integer')
const TIME_ENCODE_GENESIS = 1483246800000 // 2017-1-1

export interface PostMetaData {
    title?: string
    pub?: string
    sig?: string
    displayName?: string
    mentions?: string[]
    attachment?: Attachment
    edit?: boolean
    uidw?: string
}

export type PostTips = { symbol: string; amount: number }

export class Post {
    // Blockchain Specific
    id: number
    transaction: string
    blockApprox: number // may not be the *exact* block the transaction occured in but "near" this block
    chain: string

    // Post Data
    parentUuid: string
    threadUuid: string
    editUuid: string
    uuid: string
    vote: any
    title: string
    poster: string
    displayName: string
    content: string
    createdAt: Date
    editedAt: Date
    sub: string
    tags: string[]
    mentions: string[]
    edit: boolean
    uidw: string
    tips: PostTips

    imageData: string
    op: Post | undefined

    transfers: any[]

    // Discussion ID Post Data
    pub: string
    sig: string
    private verifySig: string

    // Attachment
    attachment: Attachment

    // Children (thread format)
    replies: Post[]

    // State Data
    totalReplies: number // only used if isOpeningPost()
    score: number // only used if isOpeningPost()
    upvotes: number
    downvotes: number
    depth: number // only used if Thread object created with

    // Aggregate Data
    myVote: { value: number }[]

    pinned = false

    hasAttachment(): boolean {
        return (
            this.attachment.value != '' &&
            this.attachment.type != '' &&
            this.attachment.display != ''
        )
    }

    isOpeningPost(): boolean {
        return this.parentUuid == ''
    }

    isAnonymousVerified(): boolean {
        if (!this.verifySig) {
            if (!ecc.isValidPublic(this.pub)) {
                this.verifySig = 'INVALID_PUB_KEY'
                return false
            }
            const uuid = this.editUuid || this.uuid
            this.verifySig = ecc.recover(this.sig, this.getSignHash(uuid))
        }

        return this.verifySig == this.pub
    }

    constructor(chain: string) {
        this.id = (Math.random() * 0xffffffff) | 0 // generate random string id
        this.transaction = ''
        this.blockApprox = 0
        this.chain = chain
        this.editUuid = ''
        this.parentUuid = ''
        this.threadUuid = ''
        this.uuid = ''
        this.title = ''
        this.poster = ''
        this.displayName = ''
        this.content = ''
        this.createdAt = new Date(0)
        this.editedAt = new Date(0)
        this.sub = ''
        this.tags = []
        this.mentions = []
        this.edit = false
        this.pub = ''
        this.sig = ''
        this.verifySig = ''
        this.attachment = new Attachment()
        this.replies = []
        this.totalReplies = 0
        this.score = 0
        this.upvotes = 0
        this.downvotes = 0
        this.depth = 0
        this.myVote = []
    }

    static fromDbObject(o: any): Post {
        let p = new Post(o.chain)
        p.id = o.id
        p.transaction = o.transaction
        p.blockApprox = o.blockApprox
        p.uuid = o.uuid
        p.parentUuid = o.parentUuid
        p.threadUuid = o.threadUuid
        p.title = o.title
        p.poster = o.poster
        p.displayName = o.displayName
        p.content = o.content
        p.createdAt = new Date(o.createdAt)
        p.sub = o.sub
        p.tags = o.tags
        p.mentions = o.mentions
        p.imageData = getIdenticon(o.pub)
        if (o.edit) {
            p.edit = true
            p.editUuid = o.edit
            p.editedAt = new Date(o.editedAt)
        }
        p.pub = o.pub
        p.sig = o.sig
        if (o.attachment) {
            p.attachment.value = o.attachment.value || p.attachment.value
            p.attachment.type = o.attachment.type || p.attachment.type
            p.attachment.display = o.attachment.display || p.attachment.display
        }
        p.totalReplies = o.totalReplies
        p.upvotes = o.upvotes
        p.downvotes = o.downvotes
        p.uidw = o.uidw || null
        p.myVote = o.myVote
        p.tips = o.tips.length
            ? o.tips.reduce((acc, curr) => {
                  const [amount, symbol] = curr.data.amount.split(' ')
                  const [fee] = curr.data.fee.split(' ')
                  acc[symbol] = (acc[symbol] ? acc[symbol] : 0) + (Number(amount) + Number(fee))
                  return acc
              }, {})
            : null

        if (o.op && o.op.length > 0) {
            let op = o.op[0];
            p.op = Post.fromDbObject(op);
        }

        return p
    }

    static decodeId(id: string) {
        let n = new BigInt(id, 36)
        let txid32 = n
            .shiftRight(32)
            .toString(16)
            .padStart(8, '0')
        let timeOffset = n.and(new BigInt('ffffffff', 16))
        let time = timeOffset.valueOf() * 1000 + TIME_ENCODE_GENESIS

        return {
            txid32: txid32,
            timeGte: time - 1000 * 60 * 3,
            timeLte: time + 1000 * 60 * 3,
        }
    }

    static encodeId(transaction: string, createdAt: Date): string {
        let txid32 = new BigInt(transaction.substring(0, 8), 16)
        let timeOffset = new BigInt(
            Math.floor((createdAt.getTime() - TIME_ENCODE_GENESIS) / 1000),
            10
        )
        let id = txid32.shiftLeft(32).or(timeOffset)
        return id.toString(36)
    }

    encodeId(): string {
        return Post.encodeId(this.transaction, this.createdAt)
    }

    getSignHash(uuid: string): string {
        const hash0 = ecc.sha256(this.content)
        const hash1 = ecc.sha256(uuid + hash0)
        return hash1
    }

    sign(privKey: string) {
        this.pub = ecc.privateToPublic(privKey)
        this.sig = ecc.sign(this.getSignHash(this.uuid), privKey)
        this.verifySig = this.pub
    }

    /*applyEdit(p: Post) {
        if (!p.edit || p.parentUuid != this.uuid) return;
        if (p.chain != this.chain) return;
        if (p.poster != this.poster) return;
        if (this.anonymousId || p.anonymousId) {
            if (p.anonymousId != this.anonymousId) return;
            if (!this.isAnonymousVerified() || !p.isAnonymousVerified()) return;
        }

        this.content = p.content;
        this.createdAt = p.createdAt;
        this.tags = p.tags;
        this.mentions = p.mentions;
        this.edit = true;

        this.anonymousId = p.anonymousId;
        this.anonymousSignature = p.anonymousSignature;
        this.verifyAnonymousSignature = p.verifyAnonymousSignature;

        this.attachment = p.attachment;
    }*/

    private autoImage() {
        if (!this.content) return

        const IMAGE_URL = /(.|)http[s]?:\/\/(\w|[:\/\.%-])+\.(png|jpg|jpeg|gif)(\?(\w|[:\/\.%-])+)?(.|)/gi
        this.content = this.content.replace(IMAGE_URL, link => {
            let trimmedLink = link.trim()
            if (!trimmedLink.startsWith('http')) {
                return link
            }
            return `![](${trimmedLink})`
        })
    }

    async normalize() {
        this.autoImage()
        await this.attachment.normalize()
    }
}
