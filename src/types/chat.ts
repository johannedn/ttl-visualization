export type ChatResponse =
  | {
      type: 'answer' | 'change_applied'
      message: string
      version_id?: string
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
