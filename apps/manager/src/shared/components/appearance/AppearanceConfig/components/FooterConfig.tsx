import { useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { AppAppearanceConfig } from '@packages/shared/schemas'
import { ConfigurationTitle } from './ConfigurationTitle'
import { ConfigurationDetails } from './ConfigurationDetails'
import { Button, Card, IconEdit16 } from '@dhis2/ui'
import { FooterConfigForm } from '../../appearance-config-forms/FooterConfig/FooterConfigForm'
import { RichTextView } from '@packages/shared/visualizations'
import { ConfigurationColor } from './ConfigurationColor'

type Props = {
    config: AppAppearanceConfig
    refetchConfig: () => void
}

export function FooterConfig({ config, refetchConfig }: Props) {
    const [showFooterConfig, setShowFooterConfig] = useState(false)
    const { footer, colors } = config
    const {
        copyright,
        footerItems,
        coloredBackground,
        footerBackgroundColor,
        usePrimaryColorAsBackgroundColor,
    } = footer

    return (
        <>
            <Card>
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center border-0 border-b border-solid border-gray-300 pb-2">
                        <ConfigurationTitle
                            title={i18n.t('Footer configuration')}
                        />
                        <Button
                            onClick={() => setShowFooterConfig(true)}
                            small
                            secondary
                            icon={<IconEdit16 />}
                        >
                            {i18n.t('Update')}
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {copyright && (
                            <ConfigurationDetails
                                title={i18n.t('Copyright')}
                                value={copyright}
                            />
                        )}
                        {coloredBackground && (
                            <ConfigurationDetails
                                title={i18n.t('Background color')}
                            >
                                <ConfigurationColor
                                    colorCode={
                                        usePrimaryColorAsBackgroundColor
                                            ? colors.primary
                                            : (footerBackgroundColor ?? '#FFF')
                                    }
                                />
                            </ConfigurationDetails>
                        )}
                        {(footerItems ?? []).map((item, index) => (
                            <ConfigurationDetails
                                key={`${index}-${item.title}`}
                                title={item.title}
                            >
                                {item.type === 'links' ? (
                                    <ul className="list-disc list-inside mx-2">
                                        {(item.links ?? []).map(
                                            (link, linkIndex) => (
                                                <li
                                                    className="decoration-none"
                                                    key={`${index}-${linkIndex}-${link.url}`}
                                                >
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        className="text-primary-500 hover:underline cursor-pointer"
                                                        rel="noreferrer"
                                                    >
                                                        {link.name}
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <div className="mx-2">
                                        <RichTextView
                                            content={item.staticContent ?? ''}
                                        />
                                    </div>
                                )}
                            </ConfigurationDetails>
                        ))}
                    </div>
                </div>
            </Card>
            {showFooterConfig && (
                <FooterConfigForm
                    configurations={config}
                    onClose={() => setShowFooterConfig(false)}
                    onComplete={() => refetchConfig()}
                />
            )}
        </>
    )
}
