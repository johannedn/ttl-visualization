import { useEffect } from 'react'
import { TableView } from '../components/TableView'
import { usePageTitle } from '@context/PageContext'

export function TableViewPage() {
	const { setTitle } = usePageTitle()

	useEffect(() => {
		setTitle('Ontology Table Overview')
	}, [setTitle])

	return <TableView/>
}