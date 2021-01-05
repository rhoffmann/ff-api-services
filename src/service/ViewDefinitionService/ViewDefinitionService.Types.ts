export interface ShortViewDefinition {
    id: string;
    type: ViewType | null;
    name: string;
    schemaId: string;
    schema: string;
    sorting: number;
}

export interface ViewDefinitionCategory {
    name: string;
    fields: string[];
}

export interface ViewDefinition extends ShortViewDefinition {
    componentId: string;
    defaultOrder: string;
    actions: string[];
    categories: ViewDefinitionCategory[];
    metadata?: object;
}

export type ViewType = 'DEFAULT' | 'LIST' | 'CARD' | 'CALENDAR' | 'MAP' | 'ENTITY_RELATION';

export interface ViewDefinitionStatistic {
    id: string;
    name: string;
    schema: string;
    categoryAmount: number;
    fieldAmount: number;
    global: boolean;
}

export interface Customisation {
    schemaName: string;
    viewName: string;
    categoryName: string;
    fieldName?: string;
    predecessor?: string;
    action: 'ADD' | 'MOVE' | 'DELETE';
    type: 'CATEGORY' | 'FIELD';
}
