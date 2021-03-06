import { RootStore, useStores } from '@stores'
import { useObserver } from 'mobx-react-lite'
import { Spin } from 'antd'
import React from 'react'

const Connections = () => {
    const { authStore }: RootStore = useStores()

    if (!authStore.hasAccount) {
        return <span className={'f6 gray'}>Please sign in to view this option</span>
    }

    return (
        <>
            <div className={'flex flex-row items-center justify-between'}>
                <span className={'db'}>
                    <span className={'db b black f6'}>EOS Wallet</span>
                    <span className={'db gray f6'}>
                        You can connect your EOS wallets to Discussions App.
                    </span>
                </span>
                <span
                    className={'db flex flex-column tr justify-end primary pointer'}
                    onClick={() => authStore.connectScatterWallet(authStore.hasEOSWallet)}
                >
                    {useObserver(() => (
                        <>
                            <span className={'db'}>
                                {!authStore.connectScatterWallet['pending'] ? (
                                    authStore.hasEOSWallet ? (
                                        '(disconnect)'
                                    ) : (
                                        '(connect)'
                                    )
                                ) : (
                                    <Spin />
                                )}
                            </span>
                            {authStore.eosWalletDisplayName && (
                                <span className={'red db'}>{authStore.eosWalletDisplayName}</span>
                            )}
                        </>
                    ))}
                </span>
            </div>
        </>
    )
}

export default Connections
