import { BaseStore, getOrCreateStore } from 'next-mobx-wrapper'
import { computed, observable, action, autorun } from 'mobx'
import { persist } from 'mobx-persist'
import { SignInMethods } from '@globals'
import { CreateForm } from '@components'
import { task } from 'mobx-task'
import { discussions, eos, init } from '@novuspherejs'
import { getUiStore, IStores } from '@stores/index'
import { sleep } from '@utils'

export default class NewAuth extends BaseStore {
    @persist('object') @observable displayName = {
        bk: '',
        scatter: '',
    }

    @persist @observable postPriv = ''
    @persist @observable tipPub = ''
    @persist @observable preferredSignInMethod = SignInMethods.brainKey

    @persist('object') @observable statusJson = null
    @observable clickedSignInMethod = ''

    // signup object
    @observable signUpObject = {
        brianKey: '',
        username: '',
        password: '',

        brianKeyVerify: '',
    }

    // login objects
    @observable signInObject = {
        ref: null,
        step: 1,
    }

    // status
    @observable hasAccount = false

    private readonly uiStore: IStores['uiStore'] = getUiStore()

    constructor() {
        super()

        this.checkInitialConditions()
    }

    @task
    @action.bound
    async checkInitialConditions() {
        await sleep(500)

        if (this.getActiveDisplayName && this.postPriv && this.tipPub) {
            this.hasAccount = true
        } else {
            this.hasAccount = false
        }
    }

    @action.bound
    setClickedSignInMethod(method: string) {
        this.clickedSignInMethod = method
    }

    /**
     * Used for posting, returns empty string if the
     * user is logged in via a non-scatter method
     */
    @computed get posterName(): string {
        if (this.preferredSignInMethod === SignInMethods.brainKey) {
            return ''
        }

        return this.getActiveDisplayName
    }

    @computed get getActiveDisplayName() {
        if (this.clickedSignInMethod === SignInMethods.brainKey) {
            return this.displayName.bk
        }

        if (this.clickedSignInMethod === SignInMethods.scatter) {
            return this.displayName.scatter
        }

        if (!this.clickedSignInMethod) {
            if (this.preferredSignInMethod === SignInMethods.brainKey) {
                return this.displayName.bk
            }

            return this.displayName.scatter
        }
    }

    @computed get hasBKAccount() {
        if (!this.displayName.bk) return false
        return this.displayName.bk
    }

    @action.bound
    setPreferredSignInMethod(method: string) {
        if (method !== this.preferredSignInMethod) {
            this.preferredSignInMethod = method
        } else {
            if (method === SignInMethods.brainKey) {
                this.preferredSignInMethod = SignInMethods.scatter
            }
            if (method === SignInMethods.scatter) {
                this.preferredSignInMethod = SignInMethods.brainKey
            }
        }
    }

    /**
     * Signup forms
     */
    get signUpForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { displayName, password } = form.values()

                    if (!form.hasError) {
                        this.signUpObject.username = displayName
                        this.signUpObject.password = password
                    }
                },
            },
            [
                {
                    name: 'displayName',
                    label: 'Display Name',
                    type: 'text',
                    value: this.signUpObject.username,
                    placeholder: 'Your display name',
                    rules: 'required|string|between:3,25',
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    value: this.signUpObject.password,
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
                {
                    name: 'passwordConfirm',
                    label: 'Password Confirmation',
                    type: 'password',
                    value: this.signUpObject.password,
                    placeholder: 'Confirm Password',
                    rules: 'required|string|same:password',
                },
            ]
        )
    }

    get verifyBKForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { bkVerify } = form.values()

                    if (!form.hasError) {
                        this.signUpObject.brianKeyVerify = bkVerify
                        this.signUpWithBK()
                    }
                },
            },
            [
                {
                    name: 'bkVerify',
                    label: 'Verify your brain key',
                    type: 'textarea',
                    rules: 'required|string',
                },
            ]
        )
    }

    @task.resolved
    @action.bound
    async generateBrianKey() {
        const key = discussions.bkCreate()
        console.log('Class: NewAuth, Function: generateBrianKey, Line 81 key: ', key)
        this.signUpObject.brianKey = key
        return key
    }

    @task.resolved
    @action.bound
    async logOut() {
        try {
            await eos.logout()
            this.hasAccount = false
            this.uiStore.showToast('You have signed out!', 'success')
        } catch (error) {
            throw error
        }
    }

    @task.resolved
    @action.bound
    async signUpWithBK() {
        try {
            if (this.signUpObject.brianKey === this.signUpObject.brianKeyVerify) {
                await this.completeSignUpProcess()
                this.uiStore.hideModal()
                this.uiStore.showToast('You have successfully signed up!', 'success')
            } else {
                this.uiStore.showToast(
                    'The key you entered does not match the one we generated. Please try again.',
                    'error'
                )
            }
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            console.error(error)
            return error
        }
    }

    /**
     * Sign in forms
     */
    get setNewBKAndPasswordForm() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { bk, displayName, password } = form.values()

                    if (!form.hasError) {
                        this.loginWithBK(bk, displayName, password)
                    }
                },
            },
            [
                {
                    name: 'bk',
                    label: 'Brain Key',
                    type: 'textarea',
                    placeholder: 'Enter your BK',
                    rules: 'required|string',
                },
                {
                    name: 'displayName',
                    label: 'Display Name',
                    type: 'text',
                    placeholder: 'Enter your preferred display name',
                    rules: 'required|string',
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
            ]
        )
    }

    get setPassword() {
        return new CreateForm(
            {
                onSubmit: form => {
                    const { password } = form.values()
                    if (!form.hasError) {
                        this.loginWithPassword(password)
                    }
                },
            },
            [
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
            ]
        )
    }

    get choosePassword() {
        return new CreateForm(
            {
                onSubmit: async form => {
                    const { password } = form.values()
                    console.log('Class: NewAuth, Function: onSubmit, Line 264 password: ', password)
                },
            },
            [
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Your password',
                    rules: 'required|string|between:5,25',
                },
                {
                    name: 'passwordConfirm',
                    label: 'Password Confirmation',
                    type: 'password',
                    placeholder: 'Confirm Password',
                    rules: 'required|string|same:password',
                },
            ]
        )
    }

    @task.resolved
    @action.bound
    async loginWithBK(bk: string, displayName: string, password: string) {
        try {
            const unparsedJSON = await this.bkToStatusJson(bk, displayName, password, null)

            if (unparsedJSON) {
                const statusJSON = JSON.parse(unparsedJSON)
                this.statusJson = statusJSON
                this.displayName.bk = statusJSON['displayName']
                await this.storeKeys(bk)

                this.completeSignInProcess()
            } else {
                console.log('failed')
            }
        } catch (error) {
            this.uiStore.showToast('Something went wrong!', 'error')
            return error
        }
    }

    @task.resolved
    @action.bound
    async loginWithPassword(password: string) {
        try {
            const bk = await discussions.bkFromStatusJson(JSON.stringify(this.statusJson), password)
            await this.loginWithBK(bk, this.statusJson['displayName'], password)
        } catch (error) {
            this.uiStore.showToast(error.message, 'error')
            return error
        }
    }

    @task.resolved
    @action.bound
    async loginWithScatter() {
        try {
            await init()
            const wallet = await eos.detectWallet()

            if (typeof wallet !== 'boolean' && wallet) {
                // prompt login
                await eos.login()
                const accountName = eos.accountName

                if (accountName) {
                    this.displayName.scatter = accountName
                    const statusJSON = await discussions.bkRetrieveStatusEOS(accountName)
                    const parsedStatusJSON = JSON.parse(statusJSON)
                    this.postPriv = parsedStatusJSON['post']
                    this.tipPub = parsedStatusJSON['tip']

                    this.completeSignInProcess()
                } else {
                    throw new Error('Failed to get account name')
                }
            } else {
                throw new Error('Failed to detect wallet')
            }
        } catch (error) {
            this.uiStore.showToast('Failed to detect wallet', 'error')
            console.log(error)
            return error
        }
    }

    @task.resolved
    @action.bound
    async handleStepSwitchForBK() {
        if (this.hasBKAccount) {
            // push them to password
            this.signInObject.ref.goToStep(3)
            console.log('handleStepSwitchForBK clicked, has bk account')
        } else {
            // let them setup a new bk
            this.signInObject.ref.goToStep(2)
            console.log('handleStepSwitchForBK clicked, does not have BK account')
        }
    }

    @action.bound
    private completeSignInProcess() {
        this.uiStore.showToast('You have successfully signed in!', 'success')
        this.hasAccount = true
        this.signInObject.ref.goToStep(1)
        this.uiStore.hideModal()
    }

    @task.resolved
    private async completeSignUpProcess() {
        try {
            console.log('signing up with BK started')
            const json = await this.bkToStatusJson(
                this.signUpObject.brianKeyVerify,
                this.signUpObject.username,
                this.signUpObject.password,
                null
            )

            this.statusJson = json
            this.displayName.bk = this.signUpObject.username
            const transact = await discussions.bkUpdateStatusEOS(json)
            await this.storeKeys(this.signUpObject.brianKeyVerify)
            console.log('signing up with BK ended')
            return transact
        } catch (error) {}
    }

    @task.resolved
    @action.bound
    private async storeKeys(bk: string) {
        try {
            const keys = await discussions.bkToKeys(bk)
            this.postPriv = keys.post.priv
            this.tipPub = keys.tip.pub
            return keys
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    @task.resolved
    @action.bound
    private async bkToStatusJson(
        bk: string,
        username: string,
        password: string,
        status: any
    ): Promise<string> {
        try {
            return await discussions.bkToStatusJson(bk, username, password, status)
        } catch (error) {
            return error
        }
    }
}

export const getNewAuthStore = getOrCreateStore('newAuthStore', NewAuth)