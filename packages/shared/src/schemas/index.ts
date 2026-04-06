export * from './ai-preservation-letter'
export * from './ai-risk-explanation'
export * from './case-file'
export * from './case'
export * from './court-document'
export * from './deadline'
// Note: discovery.ts and objection-classification.ts both export ITEM_TYPES.
// Use deep imports for those modules to avoid collision.
export * from './discovery'
export * from './document-extraction'
// Note: document.ts exports DOC_TYPES which collides with court-document.ts.
// Use deep import from './document' when you need document-specific DOC_TYPES.
// Omitting document.ts from barrel to avoid collision.
// export * from './document'
export { documentMetadataSchema, createDocumentSchema } from './document'
export * from './event'
export * from './evidence'
export * from './exhibits'
export * from './family-filing'
export * from './filing'
export * from './gatekeeper'
export * from './landlord-tenant-filing'
// Omitting ITEM_TYPES re-export from objection-classification to avoid collision with discovery.
export {
  OBJECTION_LABELS,
  type ObjectionLabel,
  classificationItemSchema,
  type ClassificationItem,
  classificationOutputSchema,
  type ClassificationOutput,
  confirmItemSchema,
  type ConfirmItem,
  confirmReviewSchema,
  type ConfirmReviewInput,
} from './objection-classification'
export * from './objection-reviews'
export * from './preservation-letter-send'
export * from './quick-resolve'
export * from './reminder-escalation'
export * from './service-facts'
export * from './small-claims-filing'
export * from './task'
export * from './trial-binders'
