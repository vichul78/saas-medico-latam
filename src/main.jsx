import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext.jsx';
import { router } from '@/router.jsx';
import '@/index.css';

/*
  Árbol de providers en orden:
    AuthProvider      — sesión + perfil + rol (debe ir FUERA de RouterProvider
                        porque RouterProvider renderiza los componentes que
                        consumen useAuth).
    RouterProvider    — enrutamiento React Router v6 con Data API.

  NOTA: RouterProvider crea su propio contexto de React.
  Para que useAuth() funcione dentro de los componentes de ruta,
  AuthProvider debe envolver a RouterProvider, no al revés.
*/
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
