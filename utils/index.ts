import { Router } from '@router'

const pjson = require('../package.json')

const uuid = require('uuidv4')

export const isServer = typeof window === 'undefined'
export const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const generateUuid = () => {
    return uuid()
}

export const getAttachmentValue = (post: any) => {
    const value = post.hash
    const type = post.urlType
    const display = post.hash
    const trust_provider = post.txidType

    return {
        value,
        display,
        trust_provider,
        type,
    }
}

export const openInNewTab = (url: string) => {
    const win = window.open(url, '_blank')
    return win.focus()
}

export const pushToThread = (post, id) => {
    Router.pushRoute(`/e/${post.sub}/${id}/${decodeURIComponent(post.title.replace(/ /g, '_'))}`)
}

export const getVersion = () => {
    return pjson.version
}
