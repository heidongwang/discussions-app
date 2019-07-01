import * as React from 'react'
import { observer } from 'mobx-react'
import classNames from 'classnames'
import Select from 'react-select'
import { Editor } from '@components'

interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
    form: IForm
    className?: string
    hideSubmitButton?: boolean
}

const Form: React.FC<FormProps> = ({ form, children, hideSubmitButton, ...props }) => {
    const renderButton = (field, type, rest) => {
        if (Array.isArray(field.accessor.$extra.options)) {
            return field.accessor.$extra.options.map(({ value, className, onClick }) => (
                <button
                    datatype={type}
                    onClick={e => {
                        form.onSubmit(e)

                        if (onClick) {
                            onClick(form.form)
                        }

                        e.preventDefault()
                    }}
                    key={`${field.name}-${value}`}
                    className={classNames([
                        'mt3 f6 link dim br2 ph3 pv2 dib mr2 pointer',
                        {
                            'white bg-green': !className,
                            [className]: className,
                        },
                    ])}
                >
                    {value}
                </button>
            ))
        }

        return (
            <button
                datatype={type}
                type={'button'}
                key={field.accessor.value}
                {...rest}
                className={classNames({
                    'button button-light dim pointer db f6 pv1 mh1 flex-auto': true,
                })}
            >
                {field.accessor.value}
            </button>
        )
    }

    const renderFields = fields => {
        return fields.map(field => {
            const bind = field.accessor.bind()

            if (field.render === false) {
                return null
            }

            switch (form.types[field.name]) {
                case 'dropdown':
                    return (
                        <div key={field.name}>
                            <div className={'field-container pt1 pb3 inline-labels'}>
                                <label htmlFor={field.accessor.id}>{field.accessor.label}</label>
                                <Select
                                    className={'w-80 db f6 react-select-dropdown'}
                                    classNamePrefix={'rs'}
                                    options={field.accessor.$extra.options}
                                    {...bind}
                                />
                            </div>
                            <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                        </div>
                    )
                case 'textarea':
                    return (
                        <div className={'field-container'} key={field.name}>
                            <textarea {...bind} />
                        </div>
                    )
                case 'richtext':
                    return (
                        <div key={field.name}>
                            <div className={'field-container pt1 inline-labels'}>
                                <label htmlFor={field.accessor.id}>{field.accessor.label}</label>
                                <Editor
                                    placeholder={field.placeholder}
                                    className={'db f6 w-80'}
                                    {...bind}
                                />
                            </div>
                            <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                        </div>
                    )
                case 'button':
                    const { type, ...rest } = bind as any
                    return (
                        <div
                            className={'field-container pb3 db flex justify-end items-center'}
                            key={field.name}
                        >
                            <div className={'w-80'}>{renderButton(field, type, rest)}</div>
                        </div>
                    )
                default:
                    return (
                        <div key={field.name}>
                            <div className={'field-container pt1 inline-labels'}>
                                <label htmlFor={field.accessor.id}>{field.accessor.label}</label>
                                <input {...bind} className={'db f6 w-100 form-input'} />
                            </div>
                            <span className={'error f6 db pv2'}>{field.accessor.error}</span>
                        </div>
                    )
            }
        })
    }

    return (
        <form {...props}>
            {renderFields(form.fields)}
            {hideSubmitButton ? null : (
                <button
                    className={'mt3 f6 link dim br2 ph3 pv2 dib white bg-green mr2 pointer'}
                    type="submit"
                    onClick={form.onSubmit}
                >
                    Submit
                </button>
            )}
        </form>
    )
}

export default observer(Form)
