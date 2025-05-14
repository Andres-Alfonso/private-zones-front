// app/api/types/stripe.types.ts

export interface StripeProduct {
    id: string;
    object: string;
    active: boolean;
    attributes: string[];
    created: number;
    default_price: string | null;
    description: string;
    features: string[];
    images: string[];
    livemode: boolean;
    marketing_features: string[];
    metadata: Record<string, any>;
    name: string;
    package_dimensions: any;
    shippable: boolean | null;
    statement_descriptor: string | null;
    tax_code: string | null;
    type: string;
    unit_label: string | null;
    updated: number;
    url: string | null;
  }
  
  export interface StripeProductListResponse {
    object: string;
    data: StripeProduct[];
    has_more: boolean;
    url: string;
}