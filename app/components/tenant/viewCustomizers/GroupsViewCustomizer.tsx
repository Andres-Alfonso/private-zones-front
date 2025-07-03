import React from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

export const GroupsViewCustomizer: React.FC<SpecificViewCustomizerProps> = (props) => {
    return (
        <ViewCustomizer
            title="Configuración de Grupos"
            description="Personaliza la apariencia de la vista de grupos"
            {...props}
        />
    );
};