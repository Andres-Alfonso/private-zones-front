// app/routes/home/_index.tsx

import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link, useNavigation, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import {
    Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, Users,
    Building2, Globe, Calendar, AlertCircle, MoreHorizontal,
    Download, Upload, TrendingUp, TrendingDown
} from "lucide-react";
import { useTenant } from "~/context/TenantContext";
import { useCurrentUser } from "~/context/AuthContext";


// export const loader: LoaderFunction = async ({ request }) => {
//   try {


//     // return json<LoaderData>({ 
//     //   tenants: tenants,
//     //   stats: mockStats,
//     //   error: null 
//     // });
//   } catch (error: any) {
//     // console.error('Error loading tenants:', error);
//     // return json<LoaderData>({ 
//     //   tenants: { data: [], total: 0, page: 1, limit: 20 },
//     //   stats: { totalTenants: 0, activeTenants: 0, trialTenants: 0, expiredTenants: 0, totalUsers: 0, totalRevenue: 0, storageUsed: 0, averageUsers: 0 },
//     //   error: error.message || 'Error al cargar los tenants' 
//     // });
//   }
// };

export default function HomeIndex() {

    const { user } = useCurrentUser();
    const { state : tenantState } = useTenant();
    const { tenant } = tenantState;

    const homeConfig = tenant?.viewConfigs?.find(
        (config: any) => config.viewType === 'home'
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Home
                </h1>

            </div>
        </div>
    );
}