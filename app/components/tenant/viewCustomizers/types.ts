export interface ViewSettings {
    customBackground?: boolean;
    backgroundType?: 'imagen' | 'color';
    backgroundImage?: string;
    backgroundColor?: string;
    backgroundImageFile?: File;
}

export interface ViewCustomizerProps {
    title: string;
    description?: string;
    onChange: (field: string, value: string | boolean | File) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    initialCustomBackground?: boolean;
    initialBackgroundType?: 'imagen' | 'color';
    initialBackgroundImage?: string;
    initialBackgroundColor?: string;
    settings?: ViewSettings;
}

export interface SpecificViewCustomizerProps {
    onChange: (field: string, value: string | boolean | File) => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    initialCustomBackground?: boolean;
    initialBackgroundType?: 'imagen' | 'color';
    initialBackgroundImage?: string;
    initialBackgroundColor?: string;
    settings?: ViewSettings;
}