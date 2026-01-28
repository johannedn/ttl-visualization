import { useEffect } from 'react'
import { GraphViewV2 } from '../components/GraphViewV2'
import { usePageTitle } from '@context/PageContext'
import type { Triple } from '../utils/ttlParser'


interface Props {
	triples: Triple[]
}


export function GraphViewV2Page({ triples }: Props) {
	const { setTitle } = usePageTitle()

	useEffect(() => {
		setTitle('Graph Visualization V2')
	}, [setTitle])

	return <GraphViewV2 triples={triples} />
}
