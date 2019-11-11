import * as React from 'react'
import { inject, observer } from 'mobx-react'
import Router from 'next/router'
import Link from 'next/link'
import { IStores } from '@stores'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faSearch, faSpinner, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tippy'
import { ModalOptions } from '@globals'
import { TagModel } from '@models/tagModel'
import { UserNotifications } from '@components'

interface ITitleHeaderProps {
    tagStore: IStores['tagStore']
    newAuthStore: IStores['newAuthStore']
    notificationsStore: IStores['notificationsStore']
    userStore: IStores['userStore']
    uiStore: IStores['uiStore']
}

interface ITitleHeaderState {
    search: string
}

@inject('tagStore', 'newAuthStore', 'userStore', 'uiStore', 'notificationsStore')
@observer
class TitleHeader extends React.Component<ITitleHeaderProps, ITitleHeaderState> {
    state = {
        search: '',
    }

    private renderUserSettings = () => {
        const { logOut } = this.props.newAuthStore

        return (
            <div className={'tooltip'} style={{ width: 200 }}>
                <Link href={'/settings'}>
                    <a rel={'Open settings'} className={'db mb2'}>
                        settings
                    </a>
                </Link>
                <a title={'ATMOS Balance'} className={'db mb2'}>
                    0 ATMOS
                </a>
                <a
                    rel={'Open settings'}
                    className={'db pointer'}
                    onClick={() => {
                        logOut()
                    }}
                >
                    {logOut['match']({
                        pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
                        rejected: () => 'Unable to disconnect',
                        resolved: () => 'disconnect',
                    })}
                </a>
            </div>
        )
    }

    private renderAuthActions = () => {
        const { notificationsStore } = this.props
        const { showModal } = this.props.uiStore
        const { userIcon } = this.props.userStore
        const { hasAccount, getActiveDisplayName, checkInitialConditions } = this.props.newAuthStore

        if (checkInitialConditions['pending']) {
            return <FontAwesomeIcon width={13} icon={faSpinner} spin />
        }

        if (hasAccount) {
            const { hasNotifications, notificationCount } = notificationsStore

            return (
                <div className={'f4 flex items-center'}>
                    <Tooltip
                        animateFill={false}
                        interactive
                        interactiveBorder={20}
                        unmountHTMLWhenHide={true}
                        html={<UserNotifications notificationsStore={notificationsStore} />}
                        position={'bottom-end'}
                        trigger={'mouseenter'}
                    >
                        <Link href={'/notifications'}>
                            <a rel={'Open your notifications'}>
                                <FontAwesomeIcon
                                    width={13}
                                    icon={faBell}
                                    className={'ph2'}
                                    color={hasNotifications ? '#ad3b2b' : '#7D8894'}
                                />
                                {hasNotifications && (
                                    <span className={'f5 b notification-count'}>
                                        {notificationCount}
                                    </span>
                                )}
                            </a>
                        </Link>
                    </Tooltip>
                    <Link href={`/new`}>
                        <button title={'Create new post'} className={'ml3'}>
                            <span className={'f6 white'}>New Post</span>
                        </button>
                    </Link>
                    <Tooltip
                        animateFill={false}
                        interactive
                        interactiveBorder={20}
                        unmountHTMLWhenHide={true}
                        html={this.renderUserSettings()}
                        position={'bottom-end'}
                        trigger={'mouseenter'}
                    >
                        <Link href={`/u/[username]`} as={`/u/${getActiveDisplayName}`}>
                            <a
                                rel={'Open your profile'}
                                className={'flex items-center user-container pointer dim'}
                            >
                                <span className={'b f6 pl1 pr3 black'}>{getActiveDisplayName}</span>
                                <img
                                    width={30}
                                    height={30}
                                    src={`data:image/png;base64,${userIcon}`}
                                    className={'post-icon mr2'}
                                    alt={'Icon'}
                                />
                            </a>
                        </Link>
                    </Tooltip>
                </div>
            )
        }

        return (
            <>
                <button
                    className={'button-outline mr2'}
                    onClick={() => showModal(ModalOptions.signIn)}
                >
                    Login
                </button>
                <button
                    onClick={() => {
                        showModal(ModalOptions.signUp)
                    }}
                >
                    Sign Up
                </button>
            </>
        )
    }

    private renderActiveTag = () => {
        const { setActiveTag, activeTag } = this.props.tagStore

        if (!activeTag) {
            return (
                <Link href={'/'} prefetch={false}>
                    <a>home</a>
                </Link>
            )
        }

        return setActiveTag['match']({
            pending: () => <FontAwesomeIcon width={13} icon={faSpinner} spin />,
            rejected: () => (
                <Link href={'/'}>
                    <a>home</a>
                </Link>
            ),
            resolved: (tagModel: TagModel) => (
                <Link href={'/tag/[name]'} as={tagModel.url}>
                    <a className={'flex items-center'}>
                        {!tagModel.icon ? null : (
                            <img
                                className={'tag-icon pr2'}
                                src={tagModel.icon}
                                alt={`${tagModel.name} icon`}
                            />
                        )}

                        <span>{tagModel.name}</span>
                    </a>
                </Link>
            ),
        })
    }

    private handleKeySearch = e => {
        const key = e.key

        if (key.match(/NumpadEnter|Enter/)) {
            const value = e.target.value
            Router.push({ pathname: '/search', query: { q: value } })
            e.preventDefault()
        }
    }

    public render(): React.ReactNode {
        return (
            <div className={'title-header flex items-center z-999'}>
                <div className={'container flex items-center justify-between'}>
                    <span className={'f4 black'}>{this.renderActiveTag()}</span>

                    <div className={'mh4 flex-auto relative flex items-center'}>
                        <input
                            className={'w-100 main-search pl4'}
                            placeholder={'Search on Discussions.app'}
                            onKeyDown={this.handleKeySearch}
                        />
                        <FontAwesomeIcon
                            width={13}
                            icon={faSearch}
                            className={'absolute left-0 ml2 pl1'}
                        />
                    </div>

                    <div className={'flex'}>{this.renderAuthActions()}</div>
                </div>
            </div>
        )
    }
}

export default TitleHeader as any
