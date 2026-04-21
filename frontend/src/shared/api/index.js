import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout as clearAuth } from '@features/auth-by-login/model/authSlice';
import { routes } from '@shared/config';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Кастомный baseQuery с перехватом 401.
 * При получении 401 от сервера (токен истёк/невалиден):
 *   1. Dispatch-ит action очистки auth состояния
 *   2. Редиректит на страницу входа
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const publicEndpoints = ['login', 'register'];
      if (publicEndpoints.includes(endpoint)) {
        return headers;
      }
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
  })(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Токен невалиден — очищаем состояние и редиректим
    api.dispatch(clearAuth());
    window.location.href = routes.auth;
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Note', 'Link', 'User'],
  endpoints: (builder) => ({
    // === NOTES (включая папки) ===
    getNotes: builder.query({
      query: (params) => ({
        url: 'notes/',
        params: params  // { is_folder: true/false } для фильтрации
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Note', id })), { type: 'Note', id: 'LIST' }]
          : [{ type: 'Note', id: 'LIST' }],
    }),
    createNote: builder.mutation({
      query: (body) => ({ url: 'notes/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),
    updateNote: builder.mutation({
      query: ({ id, body }) => ({ url: `notes/${id}/`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }],
    }),
    deleteNote: builder.mutation({
      query: (id) => ({ url: `notes/${id}/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Note', id }],
    }),

    // === FOLDERS (обратная совместимость - возвращает notes с is_folder=true) ===
    getFolders: builder.query({
      query: () => 'folders/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Note', id })), { type: 'Note', id: 'LIST' }]
          : [{ type: 'Note', id: 'LIST' }],
    }),
    createFolder: builder.mutation({
      query: (body) => ({ url: 'folders/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),
    updateFolder: builder.mutation({
      query: ({ id, body }) => ({ url: `folders/${id}/`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }],
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({ url: `folders/${id}/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Note', id }],
    }),

    // === LINKS (связи между заметками) ===
    getLinks: builder.query({
      query: () => 'links/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Link', id })), { type: 'Link', id: 'LIST' }]
          : [{ type: 'Link', id: 'LIST' }],
    }),
    createLink: builder.mutation({
      query: (body) => ({ url: 'links/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Link', id: 'LIST' }],
    }),
    deleteLink: builder.mutation({
      query: (id) => ({ url: `links/${id}/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Link', id }],
    }),

    // === USER ===
    getCurrentUser: builder.query({
      query: () => 'current-user/',
      providesTags: ['User'],
    }),
    login: builder.mutation({
      query: (body) => ({ url: 'login/', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (body) => ({ url: 'register/', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({ url: 'logout/', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: 'update-profile/', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetLinksQuery,
  useCreateLinkMutation,
  useDeleteLinkMutation,
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = api;
