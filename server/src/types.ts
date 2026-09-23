import type { CleverConditionGroup } from '../../shared/types';

export type CleverFieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'tel'
  | 'select' | 'radio' | 'checkbox' | 'checkboxGroup' | 'multiselect'
  | 'date' | 'time' | 'heading' | 'paragraph' | 'hidden';

export interface CleverField {
  name: string;
  type: CleverFieldType;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  conditions?: CleverConditionGroup | null;
}

export interface CleverPage { title?: string; description?: string; fields: CleverField[] }

export interface CleverFormDefinition {
  id?: number;
  documentId?: string;
  name: string;
  slug: string;
  lifecycle?: 'active' | 'archived';
  publishedAt?: string | null;
  requiresAuthentication?: boolean;
  schemaVersion?: number;
  version: number;
  pages: CleverPage[];
  confirmation?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
}
