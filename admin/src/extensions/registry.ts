import type * as React from 'react';

export type CleverFieldDefinition = {
  type: string;
  label: string;
  group?: string;
  create?: () => Record<string, unknown>;
  renderPreview?: React.ComponentType<any>;
  renderProperties?: React.ComponentType<any>;
};

export type CleverSettingsPanel = {
  id: string;
  title: string;
  order?: number;
  component: React.ComponentType<any>;
};

export type CleverFormAction = {
  id: string;
  label: string;
  order?: number;
  when?: (form: any) => boolean;
  run: (context: { form: any; client: any }) => Promise<void> | void;
};

class CleverFormsExtensionRegistry {
  private fields = new Map<string, CleverFieldDefinition>();
  private settingsPanels = new Map<string, CleverSettingsPanel>();
  private formActions = new Map<string, CleverFormAction>();

  registerField(definition: CleverFieldDefinition) {
    if (!definition?.type) throw new Error('CleverForms field extensions require a type.');
    this.fields.set(definition.type, definition);
  }

  registerSettingsPanel(panel: CleverSettingsPanel) {
    if (!panel?.id) throw new Error('CleverForms settings panels require an id.');
    this.settingsPanels.set(panel.id, panel);
  }

  registerFormAction(action: CleverFormAction) {
    if (!action?.id) throw new Error('CleverForms form actions require an id.');
    this.formActions.set(action.id, action);
  }

  getFields() { return [...this.fields.values()]; }
  getSettingsPanels() { return [...this.settingsPanels.values()].sort((a, b) => (a.order || 0) - (b.order || 0)); }
  getFormActions() { return [...this.formActions.values()].sort((a, b) => (a.order || 0) - (b.order || 0)); }
}

export const cleverFormsExtensions = new CleverFormsExtensionRegistry();
