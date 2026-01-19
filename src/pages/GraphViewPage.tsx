import { GraphView } from '../components/GraphView2'
import type { Triple } from '../utils/ttlParser'


interface Props {
	triples: Triple[]
}


export function GraphViewPage({ triples }: Props) {
	return <GraphView triples={triples} />
}