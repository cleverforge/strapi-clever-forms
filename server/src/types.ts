export type CleverFieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'tel'
  | 'select' | 'radio' | 'checkbox' | 'checkboxGroup' | 'multiselect'
  | 'date' | 'time' | 'heading' | 'paragraph' | 'hidden';

export interface CleverField {
  name: string;
  type: CleverFieldType;
  label?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface CleverPage { title?: string; fields: CleverField[] }

export interface CleverFormDefinition {
  id?: number;
  documentId?: string;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  requiresAuthentication?: boolean;
  version: number;
  pages: CleverPage[];
  confirmation?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
}
