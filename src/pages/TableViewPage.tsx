import { TableView } from '../components/TableView3'
import type { Triple } from '../utils/ttlParser'


interface Props {
	triples: Triple[]
}


export function TableViewPage({ triples }: Props) {
	return <TableView triples={triples} />
}