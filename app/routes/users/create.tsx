// app/routes/users/create.tsx

import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import UserForm from "~/components/users/UserForm";
import type { LoaderData, ActionData } from "~/components/users/types/user-form.types";
import { UsersAPI } from "~/api/endpoints/users";
import { commitSession, getSession } from "~/utils/session.server"; // Necesitarás crear este archivo
import { CreateUserRequest } from "~/api/types/user.types";

export const meta: MetaFunction = () => {
  return [
    { title: "Crear Usuario - Admin Panel" },
    { name: "description", content: "Crear un nuevo usuario en el sistema" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Aquí cargarías los tenants y roles desde tu API/base de datos
  const tenants = await UsersAPI.getTenants();
  const roles = await UsersAPI.getRoles();

  return json<LoaderData>({ tenants, roles });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Procesar roles múltiples
  const roles = formData.getAll('roles').filter(role => role !== '');
  
  // Validaciones básicas
  const errors: ActionData["errors"] = {};
  
  if (!data.email || typeof data.email !== "string") {
    errors.email = "El email es requerido";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "El email no tiene un formato válido";
  }

  if (!data.password || typeof data.password !== "string") {
    errors.password = "La contraseña es requerida";
  } else if (data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  if (!data.name || typeof data.name !== "string") {
    errors.name = "El nombre es requerido";
  }

  if (!data.tenantId || typeof data.tenantId !== "string") {
    errors.tenantId = "Debe seleccionar un tenant";
  }

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors, values: data }, { status: 400 });
  }

  try {
    // Construir el objeto usuario con todos los datos
    const userData: CreateUserRequest = {
      email: String(data.email),
      password: String(data.password),
      name: String(data.name),
      lastName: String(data.lastName),
      tenantId: String(data.tenantId),
      isActive: data.isActive === 'true',
      roleIds: roles.map(r => String(r)),

      profileConfig: {
        bio: String(data.bio),
        phoneNumber: String(data.phoneNumber),
        type_document: String(data.type_document),
        documentNumber: String(data.documentNumber),
        organization: String(data.organization),
        charge: String(data.charge),
        gender: String(data.gender),
        city: String(data.city),
        country: String(data.country),
        address: String(data.address),
        dateOfBirth: String(data.dateOfBirth),
      },

      notificationConfig: {
        enableNotifications: data.enableNotifications === 'on',
        smsNotifications: data.smsNotifications === 'on',
        browserNotifications: data.browserNotifications === 'on',
        securityAlerts: data.securityAlerts === 'on',
        accountUpdates: data.accountUpdates === 'on',
        systemUpdates: data.systemUpdates === 'on',
        marketingEmails: data.marketingEmails === 'on',
        newsletterEmails: data.newsletterEmails === 'on',
        reminders: data.reminders === 'on',
        mentions: data.mentions === 'on',
        directMessages: data.directMessages === 'on',
      },
    };

    // Crear el usuario
    const user = await UsersAPI.create(userData);

    if (!user) {
      return json<ActionData>({
        errors: { general: "Error al crear el usuario. Intente nuevamente." },
        values: data
      }, { status: 500 });
    }

    // Si la creación es exitosa, establecer mensaje de éxito en la sesión
    const session = await getSession(request.headers.get("Cookie"));
    session.flash("success", `Usuario "${user.name}" creado exitosamente`);

    // Redirigir a la lista de usuarios con el mensaje en la sesión
    return redirect("/users", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });

  } catch (error) {
    let errorMessage = "Error al crear el usuario.";
  
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      console.error("Error del servidor:", axiosError.response?.data);
      errorMessage = axiosError.response?.data?.message || errorMessage;
    } else {
      console.error("Error desconocido:", error);
    }

    return json<ActionData>({
      errors: { general: errorMessage },
      values: data,
    }, { status: 500 });
    // console.error('Error al crear usuario:', error);
    // return json<ActionData>({
    //   errors: { general: "Error al crear el usuario. Intente nuevamente." },
    //   values: data
    // }, { status: 500 });
  }
};

export default function CreateUser() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <UserForm
      mode="create"
      actionData={actionData}
      loaderData={loaderData}
    />
  );
}