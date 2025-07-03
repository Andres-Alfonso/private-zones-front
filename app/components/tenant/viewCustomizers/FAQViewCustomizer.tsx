import React from 'react';
import ViewCustomizer from './ViewCustomizer';
import { SpecificViewCustomizerProps } from './types';

export const FAQViewCustomizer: React.FC<SpecificViewCustomizerProps> = (props) => {
    return (
        <ViewCustomizer
            title="Configuración de FAQ"
            description="Personaliza la apariencia de la vista de preguntas frecuentes"
            {...props}
        />
    );
};