import React from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

export const MetricsViewCustomizer: React.FC<SpecificViewCustomizerProps> = (props) => {
    return (
        <ViewCustomizer
            title="Configuración de Métricas"
            description="Personaliza la apariencia de la vista de métricas y estadísticas"
            {...props}
        />
    );
};