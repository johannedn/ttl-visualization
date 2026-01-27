import { useEffect } from 'react'
import { GraphView } from '../components/GraphView2'
import { usePageTitle } from '@context/PageContext'
import type { Triple } from '../utils/ttlParser'


interface Props {
	triples: Triple[]
}


export function GraphViewPage({ triples }: Props) {
	const { setTitle } = usePageTitle()

	useEffect(() => {
		setTitle('Ontology Graph Visualization')
	}, [setTitle])

	return <GraphView triples={triples} />
}