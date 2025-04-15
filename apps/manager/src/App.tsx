import i18n from '@dhis2/d2-i18n'
import React, {FC} from 'react'
import classes from './App.module.css'

const MyApp: FC = () => {

		return (
				<div className={classes.container}>
						<h1>{i18n.t('Welcome to Portal Manager!')}</h1>
				</div>
		)
}

export default MyApp
