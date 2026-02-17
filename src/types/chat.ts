export type ChatResponse =
  | {
      type: 'answer'
      message: string
      selected_triples?: Array<{
        subject: string
        predicate: string
        object: string | {
          kind: 'literal'
          value: string
          datatype?: string
          lang?: string
        }
      }>
    }
  | {
      type: 'change_applied'
      message: string
      version_id?: string
      diff?: Record<string, any>
    }
  | {
      type: 'confirmation_needed'
      message: string
      pending_id: string
      warnings?: string[]
      risk?: string
    }
  | {
      type: 'entity_needed'
      message: string
      pending_id: string
      missing_terms?: string[]
      candidates?: string[]
    }
  | {
      type: 'error'
      message: string
    }