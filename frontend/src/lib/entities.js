export const entities = {
  book: {
    singular: 'libro', plural: 'Libros',
    columns: [{ key: 'title', label: 'Título' }, { key: 'author', label: 'Autor' },
      { key: 'publisher', label: 'Editorial' }, { key: 'edition', label: 'Edición' }],
    fields: [
      { key: 'title', label: 'Título', required: true },
      { key: 'edition', label: 'Edición' },
      { key: 'copyright', label: 'Año de copyright', type: 'number' },
      { key: 'language', label: 'Idioma' },
      { key: 'pages', label: 'Páginas', type: 'number' },
      { key: 'author', label: 'Autor' },
      { key: 'author_id', label: 'ID del autor', type: 'number' },
      { key: 'publisher', label: 'Editorial' },
      { key: 'publisher_id', label: 'ID de la editorial', type: 'number' }
    ]
  },
  author: {
    singular: 'autor', plural: 'Autores',
    columns: [{ key: 'author', label: 'Nombre' }, { key: 'nationality', label: 'Nacionalidad' },
      { key: 'birth_year', label: 'Nacimiento' }, { key: 'fields', label: 'Áreas' }],
    fields: [
      { key: 'author', label: 'Nombre', required: true },
      { key: 'nationality', label: 'Nacionalidad' },
      { key: 'birth_year', label: 'Año de nacimiento', type: 'number' },
      { key: 'fields', label: 'Áreas de trabajo' }
    ]
  },
  publisher: {
    singular: 'editorial', plural: 'Editoriales',
    columns: [{ key: 'publisher', label: 'Editorial' }, { key: 'country', label: 'País' },
      { key: 'founded', label: 'Año fundación' }, { key: 'genere', label: 'Género' }],
    fields: [
      { key: 'publisher', label: 'Nombre', required: true },
      { key: 'country', label: 'País' },
      { key: 'founded', label: 'Año de fundación', type: 'number' },
      { key: 'genere', label: 'Género' }
    ]
  }
};
