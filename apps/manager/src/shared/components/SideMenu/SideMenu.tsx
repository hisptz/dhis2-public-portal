import { colors, Menu } from '@dhis2/ui'
import { appMenus } from '../../constants/menu'
import { SideMenuItem } from './components/SideMenuItem'

export function SideMenu() {
    return (
        <aside
            style={{ background: colors.grey200 }}
            className="h-full w-[240px] min-w-[240px] flex flex-col"
        >
            <Menu className="flex-1">
                {appMenus.map((menu) => (
                    <SideMenuItem
                        label={menu.label}
                        key={menu.href}
                        to={menu.href}
                        preload="intent"
                        target="_self"
                    />
                ))}
            </Menu>
        </aside>
    )
}
