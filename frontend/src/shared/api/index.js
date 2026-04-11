import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_URL;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Не добавляем токен к публичным endpoints
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
  }),
  tagTypes: ['Note', 'Folder', 'User'],
  endpoints: (builder) => ({
    // === NOTES ===
    getNotes: builder.query({
      query: () => 'notes/',
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

    // === FOLDERS ===
    getFolders: builder.query({
      query: () => 'folders/',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Folder', id })), { type: 'Folder', id: 'LIST' }]
          : [{ type: 'Folder', id: 'LIST' }],
    }),
    createFolder: builder.mutation({
      query: (body) => ({ url: 'folders/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Folder', id: 'LIST' }],
    }),
    updateFolder: builder.mutation({
      query: ({ id, body }) => ({ url: `folders/${id}/`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Folder', id }],
    }),
    deleteFolder: builder.mutation({
      query: (id) => ({ url: `folders/${id}/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Folder', id }],
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
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = api;
